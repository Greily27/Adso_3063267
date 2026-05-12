import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Curso } from '../../cursos/entities/curso.entity';
import { CreateMateriaDto, UpdateMateriaDto } from '../dto/materia.dto';
import { Materia } from '../entities/materia.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class MateriasService {
  constructor(
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,

    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createMateriaDto: CreateMateriaDto): Promise<Materia> {
    const { cursosIds, docenteId, ...data } = createMateriaDto;

    const existeMateria = await this.materiaRepository.findOne({
      where: { nombreMateria: data.nombreMateria },
    });

    if (existeMateria) {
      throw new BadRequestException('Ya existe una materia con ese nombre');
    }

    let cursos: Curso[] = [];

    if (cursosIds && cursosIds.length > 0) {
      cursos = await this.cursoRepository.find({
        where: {
          id: In(cursosIds),
        },
      });

      if (cursos.length !== cursosIds.length) {
        throw new NotFoundException('Uno o varios cursos no existen');
      }
    }

    const docente = docenteId
      ? await this.findDocenteAsignable(docenteId)
      : undefined;

    const materia = this.materiaRepository.create({
      ...data,
      estado: data.estado ?? true,
      cursos,
      docente,
    });

    return await this.materiaRepository.save(materia);
  }

  async findAll(): Promise<Materia[]> {
    return await this.materiaRepository.find({
      relations: ['cursos', 'docente', 'docente.roles'],
      order: {
        idMateria: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Materia> {
    const materia = await this.materiaRepository.findOne({
      where: { idMateria: id },
      relations: ['cursos', 'docente', 'docente.roles'],
    });

    if (!materia) {
      throw new NotFoundException(`No se encontro la materia con id ${id}`);
    }

    return materia;
  }

  async update(
    id: number,
    updateMateriaDto: UpdateMateriaDto,
  ): Promise<Materia> {
    const materia = await this.findOne(id);
    const { cursosIds, docenteId, ...data } = updateMateriaDto;

    if (data.nombreMateria && data.nombreMateria !== materia.nombreMateria) {
      const existeMateria = await this.materiaRepository.findOne({
        where: { nombreMateria: data.nombreMateria },
      });

      if (existeMateria) {
        throw new BadRequestException('Ya existe otra materia con ese nombre');
      }
    }

    if (cursosIds) {
      const cursos = await this.cursoRepository.find({
        where: {
          id: In(cursosIds),
        },
      });

      if (cursos.length !== cursosIds.length) {
        throw new NotFoundException('Uno o varios cursos no existen');
      }

      materia.cursos = cursos;
    }

    if (docenteId) {
      materia.docente = await this.findDocenteAsignable(docenteId);
    }

    Object.assign(materia, data);

    return await this.materiaRepository.save(materia);
  }

  private async findDocenteAsignable(docenteId: number): Promise<User> {
    const docente = await this.userRepository.findOne({
      where: { id: docenteId },
      relations: ['roles'],
    });

    if (!docente) {
      throw new NotFoundException(`No se encontro el usuario con id ${docenteId}`);
    }

    const esDocente = docente.roles?.some(
      (role) => role.name?.toUpperCase() === 'DOCENTE',
    );

    if (!esDocente) {
      throw new BadRequestException(
        'Solo se pueden asignar materias a usuarios con rol DOCENTE',
      );
    }

    return docente;
  }
}
