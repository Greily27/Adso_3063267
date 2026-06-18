import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAuditorioDto, UpdateAuditorioDto } from '../dto/auditorio.dto';
import { Auditorio } from '../entities/auditorio.entity';

@Injectable()
export class AuditoriosService {
  constructor(
    @InjectRepository(Auditorio)
    private readonly auditorioRepository: Repository<Auditorio>,
  ) {}

  async create(createAuditorioDto: CreateAuditorioDto): Promise<Auditorio> {
    await this.validateNombreDisponible(createAuditorioDto.nombre);

    const auditorio = this.auditorioRepository.create(createAuditorioDto);

    return await this.auditorioRepository.save(auditorio);
  }

  async findAll(): Promise<Auditorio[]> {
    return await this.auditorioRepository.find({
      relations: ['reservas'],
      order: {
        idauditorio: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Auditorio> {
    const auditorio = await this.auditorioRepository.findOne({
      where: { idauditorio: id },
      relations: ['reservas'],
    });

    if (!auditorio) {
      throw new NotFoundException(`No se encontro el auditorio con id ${id}`);
    }

    return auditorio;
  }

  async update(
    id: number,
    updateAuditorioDto: UpdateAuditorioDto,
  ): Promise<Auditorio> {
    const auditorio = await this.findOne(id);

    if (
      updateAuditorioDto.nombre &&
      updateAuditorioDto.nombre !== auditorio.nombre
    ) {
      await this.validateNombreDisponible(updateAuditorioDto.nombre);
    }

    Object.assign(auditorio, updateAuditorioDto);

    return await this.auditorioRepository.save(auditorio);
  }

  async remove(id: number): Promise<Auditorio> {
    const auditorio = await this.findOne(id);

    return await this.auditorioRepository.remove(auditorio);
  }

  private async validateNombreDisponible(nombre: string): Promise<void> {
    const auditorio = await this.auditorioRepository.findOne({
      where: { nombre },
    });

    if (auditorio) {
      throw new BadRequestException('Ya existe un auditorio con ese nombre');
    }
  }
}
