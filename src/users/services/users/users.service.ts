import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from 'src/users/dtos/user.dto';
import { RolesService } from 'src/roles/services/roles.service';
import { Curso } from 'src/cursos/entities/curso.entity';
import { Materia } from 'src/materias/entities/materia.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import { getUploadPath } from '../../../common/uploads';

@Injectable()
export class UsersService {
  private readonly defaultPhoto = 'default.jpg';
  private readonly maxPhotoSize = 2 * 1024 * 1024;

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Materia)
    private materiaRepo: Repository<Materia>,

    // @InjectRepository(Curso)
    // private cursoRepo: Repository<Curso>, // 🔥 necesario

    private rolesService: RolesService,
  ) {}

  // =========================
  // LISTAR
  // =========================
  async findAll() {
    return await this.userRepo.find({
      relations: ['roles', 'cursos', 'materias'],
    });
  }

  // =========================
  // BUSCAR POR EMAIL
  // =========================
  async findByEmail(email: string) {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: {
        roles: {
          modules: true,
        },
        cursos: true,
        materias: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User ${email} not found`);
    }

    return user;
  }

  async findOneByEmail(email: string) {
    return await this.userRepo.findOne({
      where: { email },
    });
  }

  async savePasswordResetToken(
    userId: number,
    resetPasswordToken: string,
    resetPasswordTokenExpires: Date,
  ) {
    await this.userRepo.update(userId, {
      resetPasswordToken,
      resetPasswordTokenExpires,
    });
  }

  async findByPasswordResetToken(resetPasswordToken: string) {
    return await this.userRepo.findOne({
      where: { resetPasswordToken },
    });
  }

  async clearPasswordResetToken(userId: number) {
    await this.userRepo.update(userId, {
      resetPasswordToken: null,
      resetPasswordTokenExpires: null,
    });
  }

  async updatePasswordAndClearResetToken(user: User, password: string) {
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = null;
    user.resetPasswordTokenExpires = null;

    return await this.userRepo.save(user);
  }

  // =========================
  // BUSCAR UNO
  // =========================
  async findOne(userId: number) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['roles', 'cursos', 'materias'],
    });

    if (!user) {
      throw new NotFoundException(`User #${userId} not found`);
    }

    return user;
  }

  // =========================
  // CREAR USUARIO
  // =========================
  async create(createUserDto: CreateUserDto) {
    const { roleIds, materiaIds, password, ...userData } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const roles = await this.rolesService.findByIds(roleIds);

    if (roles.length !== roleIds.length) {
      throw new NotFoundException('Some roles were not found');
    }

    const newUser = this.userRepo.create({
      ...userData,
      photo: await this.resolvePhoto(userData.photo),
      password: hashedPassword,
      roles,
    });

    const savedUser = await this.userRepo.save(newUser);

    if (materiaIds) {
      await this.asignarMateriasADocente(savedUser, materiaIds);
    }

    return await this.findOne(savedUser.id);
  }

  // =========================
  // ACTUALIZAR USUARIO
  // =========================
  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const { roleIds, materiaIds, password, photo, ...userData } = updateUserDto;

    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['roles', 'materias'],
    });

    if (!user) throw new NotFoundException('User not found');

    // roles
    if (roleIds) {
      const roles = await this.rolesService.findByIds(roleIds);

      if (roles.length !== roleIds.length) {
        throw new NotFoundException('Some roles were not found');
      }

      user.roles = roles;
    }

    // password
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    this.userRepo.merge(user, {
      ...userData,
      ...(Object.prototype.hasOwnProperty.call(updateUserDto, 'photo')
        ? { photo: await this.resolvePhoto(photo) }
        : {}),
    });

    const savedUser = await this.userRepo.save(user);

    if (materiaIds) {
      await this.asignarMateriasADocente(savedUser, materiaIds);
    }

    return await this.findOne(savedUser.id);
  }

  async updatePhoto(id: number, photo: string) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.photo = await this.resolvePhoto(photo);
    const savedUser = await this.userRepo.save(user);

    return await this.findOne(savedUser.id);
  }

  private async asignarMateriasADocente(user: User, materiaIds: number[]) {
    const esDocente = user.roles?.some(
      (role) => role.name?.toUpperCase() === 'DOCENTE',
    );

    if (!esDocente) {
      throw new BadRequestException(
        'Solo se pueden asignar materias a usuarios con rol DOCENTE',
      );
    }

    const materias = await this.materiaRepo.find({
      where: { idMateria: In(materiaIds) },
    });

    if (materias.length !== materiaIds.length) {
      throw new NotFoundException('Una o varias materias no existen');
    }

    user.materias = materias;
    await this.userRepo.save(user);
  }

  private async resolvePhoto(photo?: string | null): Promise<string> {
    if (!photo || photo.trim() === '') {
      return this.defaultPhoto;
    }

    const trimmedPhoto = photo.trim();

    if (!trimmedPhoto.startsWith('data:image/')) {
      return trimmedPhoto;
    }

    return await this.saveBase64Photo(trimmedPhoto);
  }

  private async saveBase64Photo(photo: string): Promise<string> {
    const match = photo.match(
      /^data:image\/(jpeg|jpg|png|webp);base64,([A-Za-z0-9+/=\r\n]+)$/,
    );

    if (!match) {
      throw new BadRequestException(
        'La foto debe ser una imagen JPG, PNG o WEBP valida',
      );
    }

    const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
    const buffer = Buffer.from(match[2].replace(/\s/g, ''), 'base64');

    if (buffer.length > this.maxPhotoSize) {
      throw new BadRequestException('La foto no puede superar 2 MB');
    }

    const uploadDir = getUploadPath('users');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    await writeFile(getUploadPath('users', filename), buffer);

    return `users/${filename}`;
  }

  // // =========================
  // // ASIGNAR CURSO 🔥🔥🔥
  // // =========================
  // async asignarCurso(userId: number, cursoId: number) {

  //     const user = await this.userRepo.findOne({
  //         where: { id: userId },
  //         relations: ['roles', 'cursos'],
  //     });

  //     if (!user) {
  //         throw new NotFoundException('Usuario no encontrado');
  //     }

  //     const curso = await this.cursoRepo.findOne({
  //         where: { id: cursoId, isActive: true },
  //     });

  //     if (!curso) {
  //         throw new NotFoundException('Curso no encontrado o inactivo');
  //     }

  //     const esEstudiante = user.roles.some(r => r.name === 'ESTUDIANTE');
  //     const esDocente = user.roles.some(r => r.name === 'DOCENTE');

  //     //ESTUDIANTE → SOLO 1 CURSO
  //     if (esEstudiante) {

  //         if (user.cursos && user.cursos.length > 0) {
  //             throw new BadRequestException(
  //                 'El estudiante ya tiene un curso asignado'
  //             );
  //         }

  //         user.cursos = [curso];
  //     }

  //     //El docente va a tener varios cursos
  //     else if (esDocente) {

  //         const yaExiste = user.cursos?.some(c => c.id === cursoId);

  //         if (yaExiste) {
  //             throw new BadRequestException(
  //                 'El docente ya tiene este curso asignado'
  //             );
  //         }

  //         user.cursos = [...(user.cursos || []), curso];
  //     }

  //     else {
  //         throw new BadRequestException('El usuario no tiene rol válido');
  //     }

  //     return await this.userRepo.save(user);
  // }

  // ELIMINAR
  async deleteUser(idUser: number) {
    const user = await this.findOne(idUser);
    return await this.userRepo.remove(user);
  }
}
