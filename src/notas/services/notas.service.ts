import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Materia } from '../../materias/entities/materia.entity';
import { CreateNotaDto, UpdateNotaDto } from '../dto/nota.dto';
import { Nota } from '../entities/nota.entity';

@Injectable()
export class NotasService {
  constructor(
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,

    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,
  ) {}

  async create(createNotaDto: CreateNotaDto): Promise<Nota> {
    const { materiaId, ...data } = createNotaDto;
    const materia = await this.materiaRepository.findOne({
      where: { idMateria: materiaId },
    });

    if (!materia) {
      throw new NotFoundException(
        `No se encontro la materia con id ${materiaId}`,
      );
    }

    const nota = this.notaRepository.create({
      ...data,
      materia,
    });

    return await this.notaRepository.save(nota);
  }

  async findAll(): Promise<Nota[]> {
    return await this.notaRepository.find({
      relations: ['materia'],
      order: {
        idNota: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Nota> {
    const nota = await this.notaRepository.findOne({
      where: { idNota: id },
      relations: ['materia'],
    });

    if (!nota) {
      throw new NotFoundException(`No se encontro la nota con id ${id}`);
    }

    return nota;
  }

  async update(id: number, updateNotaDto: UpdateNotaDto): Promise<Nota> {
    const nota = await this.findOne(id);
    const { materiaId, ...data } = updateNotaDto;

    if (materiaId) {
      const materia = await this.materiaRepository.findOne({
        where: { idMateria: materiaId },
      });

      if (!materia) {
        throw new NotFoundException(
          `No se encontro la materia con id ${materiaId}`,
        );
      }

      nota.materia = materia;
    }

    Object.assign(nota, data);

    return await this.notaRepository.save(nota);
  }

  async remove(id: number): Promise<Nota> {
    const nota = await this.findOne(id);

    return await this.notaRepository.remove(nota);
  }
}
