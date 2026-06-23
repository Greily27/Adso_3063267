import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePeriodoDto } from '../dto/create-periodo.dto';
import { UpdatePeriodoDto } from '../dto/update-periodo.dto';
import { Periodo } from '../entities/periodo.entity';

@Injectable()
export class PeriodoService {
  constructor(
    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
  ) {}

  async create(createPeriodoDto: CreatePeriodoDto): Promise<Periodo> {
    this.validateDates(
      createPeriodoDto.fechaInicial,
      createPeriodoDto.fechaFinal,
    );

    const exists = await this.periodoRepository.findOne({
      where: { nombrePeriodo: createPeriodoDto.nombrePeriodo },
    });

    if (exists) {
      throw new BadRequestException('Ya existe un periodo con ese nombre');
    }

    const periodo = this.periodoRepository.create(createPeriodoDto);

    return await this.periodoRepository.save(periodo);
  }

  async findAll(): Promise<Periodo[]> {
    return await this.periodoRepository.find({
      order: {
        idPeriodo: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Periodo> {
    const periodo = await this.periodoRepository.findOne({
      where: { idPeriodo: id },
    });

    if (!periodo) {
      throw new NotFoundException(`No se encontro el periodo con id ${id}`);
    }

    return periodo;
  }

  async update(
    id: number,
    updatePeriodoDto: UpdatePeriodoDto,
  ): Promise<Periodo> {
    const periodo = await this.findOne(id);
    const fechaInicial = updatePeriodoDto.fechaInicial ?? periodo.fechaInicial;
    const fechaFinal = updatePeriodoDto.fechaFinal ?? periodo.fechaFinal;

    this.validateDates(fechaInicial, fechaFinal);

    if (
      updatePeriodoDto.nombrePeriodo &&
      updatePeriodoDto.nombrePeriodo !== periodo.nombrePeriodo
    ) {
      const exists = await this.periodoRepository.findOne({
        where: { nombrePeriodo: updatePeriodoDto.nombrePeriodo },
      });

      if (exists) {
        throw new BadRequestException('Ya existe otro periodo con ese nombre');
      }
    }

    Object.assign(periodo, updatePeriodoDto);

    return await this.periodoRepository.save(periodo);
  }

  async remove(id: number): Promise<void> {
    const periodo = await this.findOne(id);

    await this.periodoRepository.remove(periodo);
  }

  private validateDates(
    fechaInicial: string | Date,
    fechaFinal: string | Date,
  ) {
    if (new Date(fechaFinal) < new Date(fechaInicial)) {
      throw new BadRequestException(
        'La fecha final no puede ser menor que la fecha inicial',
      );
    }
  }
}
