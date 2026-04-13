import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Materia } from '../entities/materia.entity';
import { Curso } from '../../cursos/entities/curso.entity';
import { CreateMateriaDto, UpdateMateriaDto } from '../dto/materia.dto';

@Injectable()
export class MateriasService {
  constructor(
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,

    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) { }

  async create(createMateriaDto: CreateMateriaDto): Promise<Materia> {
    const { cursosIds, ...data } = createMateriaDto;

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

    const materia = this.materiaRepository.create({
      ...data,
      estado: data.estado ?? true,
      cursos,
    });

    return await this.materiaRepository.save(materia);
  }

  async findAll(): Promise<Materia[]> {
    return await this.materiaRepository.find({
      relations: ['cursos'],
      order: {
        idMateria: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Materia> {
    const materia = await this.materiaRepository.findOne({
      where: { idMateria: id },
      relations: ['cursos'],
    });

    if (!materia) {
      throw new NotFoundException(`No se encontró la materia con id ${id}`);
    }

    return materia;
  }

  async update(id: number, updateMateriaDto: UpdateMateriaDto): Promise<Materia> {
    const materia = await this.findOne(id);
    const { cursosIds, ...data } = updateMateriaDto;

    if (
      data.nombreMateria &&
      data.nombreMateria !== materia.nombreMateria
    ) {
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

    Object.assign(materia, data);

    return await this.materiaRepository.save(materia);
  }

  async remove(id: number) {
    const materia = await this.findOne(id);

    if (!materia.estado) {
      throw new BadRequestException('La materia ya está desactivada');
    }

    materia.estado = false;

    await this.materiaRepository.save(materia);

    return {
      message: 'Materia desactivada correctamente',
      materia,
    };
  }

  async activar(id: number) {
    const materia = await this.findOne(id);

    if (materia.estado) {
      throw new BadRequestException('La materia ya está activa');
    }

    materia.estado = true;

    await this.materiaRepository.save(materia);

    return {
      message: 'Materia activada correctamente',
      materia,
    };
  }
}