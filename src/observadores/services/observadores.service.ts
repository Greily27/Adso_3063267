import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  CreateObservadorDto,
  UpdateObservadorDto,
} from '../dto/observador.dto';
import { Observador } from '../entities/observador.entity';

@Injectable()
export class ObservadoresService {
  constructor(
    @InjectRepository(Observador)
    private readonly observadorRepository: Repository<Observador>,
  ) {}

  async create(createObservadorDto: CreateObservadorDto): Promise<Observador> {
    const observador = this.observadorRepository.create({
      ...createObservadorDto,
      fecha: new Date(createObservadorDto.fecha),
    });

    return await this.observadorRepository.save(observador);
  }

  async findAll(): Promise<Observador[]> {
    return await this.observadorRepository.find({
      order: {
        idObservador: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Observador> {
    const observador = await this.observadorRepository.findOne({
      where: { idObservador: id },
    });

    if (!observador) {
      throw new NotFoundException(
        `No se encontro el observador con id ${id}`,
      );
    }

    return observador;
  }

  async update(
    id: number,
    updateObservadorDto: UpdateObservadorDto,
  ): Promise<Observador> {
    const observador = await this.findOne(id);

    Object.assign(observador, {
      ...updateObservadorDto,
      fecha: updateObservadorDto.fecha
        ? new Date(updateObservadorDto.fecha)
        : observador.fecha,
    });

    return await this.observadorRepository.save(observador);
  }

  async remove(id: number): Promise<Observador> {
    const observador = await this.findOne(id);

    return await this.observadorRepository.remove(observador);
  }
}
