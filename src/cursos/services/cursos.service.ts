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
import { AsignacionesService } from 'src/asignaciones/services/asignaciones.service';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,

    private readonly asignacionesService: AsignacionesService,
  ) {}

  //======CREAR=========
  async create(dto: CreateCursoDto) {
    const { directorCurso, docentesIds, materiasIds, asignaciones, ...data } =
      dto;
    const existing = await this.cursoRepository.findOne({
      where: { nombreCurso: data.nombreCurso },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un curso con ese nombre');
    }

    await this.validateDirectorCurso(directorCurso);
    const docentes = await this.findDocentesByIds(
      this.mergeIds(
        docentesIds,
        asignaciones?.map((asignacion) => asignacion.docenteId),
      ),
    );
    const materias = await this.findMateriasByIds(
      this.mergeIds(
        materiasIds,
        asignaciones?.map((asignacion) => asignacion.materiaId),
      ),
    );

    const curso = this.cursoRepository.create({
      ...data,
      directorCurso,
      docentes,
      materias,
    });

    const savedCurso = await this.cursoRepository.save(curso);

    if (asignaciones && asignaciones.length > 0) {
      await this.asignacionesService.createManyForCurso(
        savedCurso.id,
        asignaciones,
      );
    }

    return await this.findOne(savedCurso.id);
  }

  //========LISTAR========
  async findAll() {
    return await this.cursoRepository.find({
      where: { isActive: true },
      relations: ['estudiantes', 'docentes', 'materias', 'asignaciones'],
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
        'asignaciones',
      ],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    return curso;
  }

  //=======ACTUALIZAR============
  async update(id: number, dto: UpdateCursoDto) {
    const { directorCurso, docentesIds, materiasIds, asignaciones, ...data } =
      dto;
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

    if (asignaciones !== undefined) {
      curso.docentes = await this.findDocentesByIds(
        this.mergeIds(
          curso.docentes?.map((docente) => docente.id),
          asignaciones.map((asignacion) => asignacion.docenteId),
        ),
      );
      curso.materias = await this.findMateriasByIds(
        this.mergeIds(
          curso.materias?.map((materia) => materia.idMateria),
          asignaciones.map((asignacion) => asignacion.materiaId),
        ),
      );
    }

    Object.assign(curso, {
      ...data,
    });

    const savedCurso = await this.cursoRepository.save(curso);

    if (asignaciones !== undefined) {
      await this.asignacionesService.replaceForCurso(
        savedCurso.id,
        asignaciones,
      );
    }

    return await this.findOne(savedCurso.id);
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
        'asignaciones',
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

  private async validateDirectorCurso(userId?: number): Promise<User | null> {
    if (userId === undefined || userId === null) {
      return null;
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Director de curso no existe');
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

  private mergeIds(ids?: number[], idsFromAsignaciones?: number[]) {
    return [...new Set([...(ids ?? []), ...(idsFromAsignaciones ?? [])])];
  }
}
