import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from '../entities/curso.entity';
import { In, Repository } from 'typeorm';
import { CreateCursoDto, UpdateCursoDto } from '../dtos/create-curso.dto';
import { User } from 'src/users/entities/user.entity';
import { Materia } from 'src/materias/entities/materia.entity';

@Injectable()
export class CursosService {
  private readonly directorCursoRoleNames = [
    'directorcurso',
    'directordecurso',
  ];

  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
  ) {}

  //======CREAR=========
  async create(dto: CreateCursoDto) {
    const { directorCurso, docentesIds, materiasIds, ...data } = dto;
    const existing = await this.cursoRepository.findOne({
      where: { nombreCurso: data.nombreCurso },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un curso con ese nombre');
    }

    await this.validateDirectorCurso(directorCurso);
    const docentes = await this.findDocentesByIds(docentesIds);
    const materias = await this.findMateriasByIds(materiasIds);

    const curso = this.cursoRepository.create({
      ...data,
      directorCurso,
      docentes,
      materias,
    });

    return await this.cursoRepository.save(curso);
  }

  //========LISTAR========
  async findAll() {
    return await this.cursoRepository.find({
      where: { isActive: true },
      relations: ['estudiantes', 'docentes', 'materias'],
    });
  }

  //=======BUSCAR UNO=======
  async findOne(id: number) {
    const curso = await this.cursoRepository.findOne({
      where: { id, isActive: true },
      relations: [
        'estudiantes',
        'estudiantes.user',
        'docentes',
        'materias',
      ],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    return curso;
  }

  //=======ACTUALIZAR============
  async update(id: number, dto: UpdateCursoDto) {
    const { directorCurso, docentesIds, materiasIds, ...data } = dto;
    const curso = await this.findOne(id);

    if (data.nombreCurso) {
      const existing = await this.cursoRepository.findOne({
        where: { nombreCurso: data.nombreCurso },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Ya existe un curso con ese nombre');
      }
    }

    if (directorCurso !== undefined) {
      await this.validateDirectorCurso(directorCurso);
      curso.directorCurso = directorCurso;
    }

    if (docentesIds !== undefined) {
      curso.docentes = await this.findDocentesByIds(docentesIds);
    }

    if (materiasIds !== undefined) {
      curso.materias = await this.findMateriasByIds(materiasIds);
    }

    Object.assign(curso, {
      ...data,
    });

    return await this.cursoRepository.save(curso);
  }

  //======DESACTIVAR=========
  async deactivate(id: number) {
    const curso = await this.cursoRepository.findOne({
      where: { id },
      relations: ['estudiantes'],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    if (curso.estudiantes.length > 0) {
      throw new BadRequestException(
        'No se puede desactivar el curso porque tiene estudiantes',
      );
    }

    curso.isActive = false;

    return await this.cursoRepository.save(curso);
  }

  //======OBTENER ESTUDIANTES===========
  async getEstudiantes(id: number) {
    const curso = await this.cursoRepository.findOne({
      where: { id },
      relations: [
        'estudiantes',
        'estudiantes.user',
        'docentes',
        'materias',
      ],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    const estudiantes = curso.estudiantes.map((est) => ({
      id: est.user.id,
      nombres: est.user.names,
      apellidos: est.user.lastNames,
      promedio: est.promedio,
    }));

    return {
      curso: curso.nombreCurso,
      directorCurso: curso.directorCurso,
      docentes: curso.docentes?.map((docente) => ({
        id: docente.id,
        nombres: docente.names,
        apellidos: docente.lastNames,
      })),
      totalEstudiantes: estudiantes.length,
      estudiantes,
    };
  }

  private async validateDirectorCurso(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, isActive: true },
      relations: ['roles'],
    });

    if (!user) {
      throw new NotFoundException('Director de curso no existe');
    }

    const hasDirectorRole = user.roles?.some((role) =>
      this.directorCursoRoleNames.includes(this.normalizeRoleName(role.name)),
    );

    if (!hasDirectorRole) {
      throw new BadRequestException(
        'El usuario asignado no tiene el rol director de curso',
      );
    }

    return user;
  }

  private async findDocentesByIds(docentesIds?: number[]): Promise<User[]> {
    if (!docentesIds || docentesIds.length === 0) {
      return [];
    }

    const docentes = await this.userRepository.find({
      where: {
        id: In(docentesIds),
        isActive: true,
      },
      relations: ['roles'],
    });

    if (docentes.length !== docentesIds.length) {
      throw new NotFoundException('Uno o varios docentes no existen');
    }

    const invalidDocente = docentes.find(
      (docente) =>
        !docente.roles?.some(
          (role) => role.name?.toUpperCase() === 'DOCENTE',
        ),
    );

    if (invalidDocente) {
      throw new BadRequestException(
        'Solo se pueden asignar usuarios con rol DOCENTE al curso',
      );
    }

    return docentes;
  }

  private async findMateriasByIds(materiasIds?: number[]): Promise<Materia[]> {
    if (!materiasIds || materiasIds.length === 0) {
      return [];
    }

    const materias = await this.materiaRepository.find({
      where: {
        idMateria: In(materiasIds),
      },
    });

    if (materias.length !== materiasIds.length) {
      throw new NotFoundException('Una o varias materias no existen');
    }

    return materias;
  }

  private normalizeRoleName(roleName: string) {
    return roleName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toLowerCase();
  }
}
