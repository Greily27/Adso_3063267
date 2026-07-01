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
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Estudiante } from '../entities/estudiante.entity';
import { Role } from 'src/roles/entities/role.entity';
import { AuthService } from 'src/auth/services/auth.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class EstudiantesService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,

    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
  ) {}

  //CREAR
  async create(dto: CreateEstudianteDto) {
    const result = await this.dataSource.transaction(async (manager) => {
      const { userId, cursoId, acudienteUserIds, ...data } = dto;
      const user = await manager.findOne(User, {
        where: { id: userId },
        relations: ['estudiante'],
      });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
      if (user.estudiante) {
        throw new BadRequestException('El usuario ya es estudiante');
      }

      const curso = await manager.findOne(Curso, {
        where: { id: cursoId },
      });
      if (!curso) {
        throw new NotFoundException('Curso no encontrado');
      }

      const acudienteAutomatico = await this.findOrCreateAcudiente(
        manager,
        dto,
      );
      const acudientesAdicionales = await this.findAcudientesWithManager(
        manager,
        acudienteUserIds,
      );
      const acudientes = [
        acudienteAutomatico.user,
        ...acudientesAdicionales,
      ].filter(
        (acudiente, index, values) =>
          values.findIndex((item) => item.id === acudiente.id) === index,
      );

      const estudiante = manager.create(Estudiante, {
        ...data,
        user,
        curso,
        acudientes,
      });
      const saved = await manager.save(Estudiante, estudiante);

      return {
        estudiante: saved,
        nuevoAcudienteEmail: acudienteAutomatico.created
          ? acudienteAutomatico.user.email
          : null,
      };
    });

    if (result.nuevoAcudienteEmail) {
      await this.authService.forgotPassword(result.nuevoAcudienteEmail);
    }

    return this.toSafeResponse(result.estudiante);
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

  private async findOrCreateAcudiente(
    manager: EntityManager,
    dto: CreateEstudianteDto,
  ): Promise<{ user: User; created: boolean }> {
    const documento = dto.documentoTutor.trim();
    const email = dto.emailTutor.trim().toLowerCase();
    const role = await manager.findOne(Role, {
      where: { name: 'ACUDIENTE' },
    });

    if (!role) {
      throw new NotFoundException(
        'No existe el rol ACUDIENTE. Ejecute la migración pendiente',
      );
    }

    const [porDocumento, porEmail] = await Promise.all([
      manager.findOne(User, {
        where: { document: documento },
        relations: ['roles'],
      }),
      manager.findOne(User, {
        where: { email },
        relations: ['roles'],
      }),
    ]);

    if (porDocumento && porEmail && porDocumento.id !== porEmail.id) {
      throw new BadRequestException(
        'El documento y el correo del acudiente pertenecen a usuarios diferentes',
      );
    }

    if (porEmail && porEmail.document !== documento) {
      throw new BadRequestException(
        'El correo del acudiente ya pertenece a otro documento',
      );
    }

    const existente = porDocumento ?? porEmail;
    if (existente) {
      const tieneRol = existente.roles?.some(
        (item) => String(item.name).trim().toUpperCase() === 'ACUDIENTE',
      );
      if (!tieneRol) {
        existente.roles = [...(existente.roles ?? []), role];
        await manager.save(User, existente);
      }
      return { user: existente, created: false };
    }

    const passwordTemporal = randomBytes(32).toString('hex');
    const nuevo = manager.create(User, {
      names: dto.nombreTutor.trim(),
      lastNames: dto.apellidoTutor.trim(),
      phone: dto.telefonoTutor.trim(),
      address: 'Pendiente por registrar',
      docType: dto.tipoDocTutor.trim(),
      document: documento,
      photo: 'default.jpg',
      password: await bcrypt.hash(passwordTemporal, 10),
      email,
      isActive: true,
      roles: [role],
    });

    return {
      user: await manager.save(User, nuevo),
      created: true,
    };
  }

  private async findAcudientesWithManager(
    manager: EntityManager,
    ids?: number[],
  ): Promise<User[]> {
    if (!ids?.length) return [];

    const uniqueIds = [...new Set(ids)];
    const acudientes = await manager.find(User, {
      where: { id: In(uniqueIds) },
      relations: ['roles'],
    });
    if (acudientes.length !== uniqueIds.length) {
      throw new NotFoundException('Uno o varios acudientes no existen');
    }

    const invalido = acudientes.find(
      (acudiente) =>
        !acudiente.roles?.some(
          (role) => String(role.name).trim().toUpperCase() === 'ACUDIENTE',
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
