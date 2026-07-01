import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Curso } from 'src/cursos/entities/curso.entity';
import {
  CreateEstudianteDto,
  UpdateEstudianteDto,
} from '../dto/estudiante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Estudiante } from '../entities/estudiante.entity';

@Injectable()
export class EstudiantesService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  //CREAR
  async create(dto: CreateEstudianteDto) {
    const { userId, cursoId, acudienteUserIds, ...data } = dto;
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['estudiante'],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (user.estudiante) {
      throw new BadRequestException('El usuario ya es estudiante');
    }
    const curso = await this.cursoRepository.findOne({
      where: { id: cursoId },
    });
    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }
    const estudiante = this.estudianteRepository.create({
      ...data,
      user,
      curso,
      acudientes: await this.findAcudientes(acudienteUserIds),
    });
    return this.toSafeResponse(
      await this.estudianteRepository.save(estudiante),
    );
  }

  //LISTAR
  async findAll() {
    const estudiantes = await this.estudianteRepository.find({
      relations: ['user', 'curso', 'acudientes', 'acudientes.roles'],
    });
    return estudiantes.map((estudiante) => this.toSafeResponse(estudiante));
  }

  //OBTENER UNO
  async findOne(id: number) {
    return this.toSafeResponse(await this.findOneEntity(id));
  }

  async findAcudidos(usuarioId: number) {
    const usuario = await this.userRepository.findOne({
      where: { id: usuarioId },
      relations: [
        'roles',
        'acudidos',
        'acudidos.user',
        'acudidos.curso',
        'acudidos.acudientes',
      ],
    });

    if (
      !usuario?.roles?.some(
        (role) => String(role.name).trim().toUpperCase() === 'ACUDIENTE',
      )
    ) {
      throw new BadRequestException('El usuario no tiene el rol ACUDIENTE');
    }

    return (usuario.acudidos ?? []).map((estudiante) =>
      this.toSafeResponse(estudiante),
    );
  }

  private async findOneEntity(id: number) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['user', 'curso', 'acudientes', 'acudientes.roles'],
    });
    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    return estudiante;
  }

  //ACTUALIZAR
  async update(id: number, dto: UpdateEstudianteDto) {
    const estudiante = await this.findOneEntity(id);
    const { cursoId, userId, acudienteUserIds, ...data } = dto;
    void userId;
    //actualizar curso si viene
    if (cursoId) {
      const curso = await this.cursoRepository.findOne({
        where: { id: cursoId },
      });
      if (!curso) {
        throw new NotFoundException('Curso no encontrado');
      }
      estudiante.curso = curso;
    }

    if (acudienteUserIds !== undefined) {
      estudiante.acudientes = await this.findAcudientes(acudienteUserIds);
    }

    Object.assign(estudiante, data);

    return this.toSafeResponse(
      await this.estudianteRepository.save(estudiante),
    );
  }

  private async findAcudientes(ids?: number[]): Promise<User[]> {
    if (!ids?.length) {
      return [];
    }

    const uniqueIds = [...new Set(ids)];
    const acudientes = await this.userRepository.find({
      where: { id: In(uniqueIds) },
      relations: ['roles'],
    });

    if (acudientes.length !== uniqueIds.length) {
      throw new NotFoundException('Uno o varios acudientes no existen');
    }

    const invalido = acudientes.find(
      (acudiente) =>
        !acudiente.roles?.some((role) =>
          ['ACUDIENTE'].includes(String(role.name).trim().toUpperCase()),
        ),
    );

    if (invalido) {
      throw new BadRequestException(
        `El usuario ${invalido.id} no tiene el rol ACUDIENTE`,
      );
    }

    return acudientes;
  }

  private toSafeResponse(estudiante: Estudiante) {
    return {
      ...estudiante,
      user: this.sanitizeUser(estudiante.user),
      acudientes:
        estudiante.acudientes?.map((acudiente) =>
          this.sanitizeUser(acudiente),
        ) ?? [],
    };
  }

  private sanitizeUser(user: User) {
    const {
      password: _password,
      resetPasswordToken: _resetPasswordToken,
      resetPasswordTokenExpires: _resetPasswordTokenExpires,
      ...safeUser
    } = user;
    void _password;
    void _resetPasswordToken;
    void _resetPasswordTokenExpires;
    return safeUser;
  }
}
