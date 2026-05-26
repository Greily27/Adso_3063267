import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Asignacion } from '../../asignaciones/entities/asignacione.entity';
import { Materia } from '../../materias/entities/materia.entity';
import { Periodo } from '../../periodo/entities/periodo.entity';
import { CreateNotaDto, UpdateNotaDto } from '../dto/nota.dto';
import { Nota } from '../entities/nota.entity';

@Injectable()
export class NotasService {
  constructor(
    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,

    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,

    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,

    @InjectRepository(Periodo)
    private readonly periodoRepository: Repository<Periodo>,
  ) {}

  async create(createNotaDto: CreateNotaDto): Promise<Nota> {
    const { materiaId, cursoId, periodoId, ...data } = createNotaDto;
    const asignacion = await this.findAsignacion({
      cursoId,
      materiaId,
    });
    const materia = await this.findMateria(asignacion.materiaId);
    const periodo = await this.findPeriodo(periodoId);

    const nota = this.notaRepository.create({
      ...data,
      cursoId: asignacion.cursoId,
      materia,
      periodo: periodo.idPeriodo,
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
    const { materiaId, cursoId, periodoId, ...data } = updateNotaDto;
    const debeActualizarAsignacion =
      cursoId !== undefined || materiaId !== undefined;

    if (debeActualizarAsignacion) {
      const asignacion = await this.findAsignacion({
        cursoId: cursoId ?? nota.cursoId ?? undefined,
        materiaId: materiaId ?? nota.materia?.idMateria,
      });

      nota.cursoId = asignacion.cursoId;
      nota.materia = await this.findMateria(asignacion.materiaId);
    }

    if (periodoId !== undefined) {
      const periodo = await this.findPeriodo(periodoId);
      nota.periodo = periodo.idPeriodo;
    }

    Object.assign(nota, data);

    return await this.notaRepository.save(nota);
  }

  async remove(id: number): Promise<Nota> {
    const nota = await this.findOne(id);

    return await this.notaRepository.remove(nota);
  }

  private async findAsignacion(params: {
    cursoId?: number;
    materiaId?: number;
  }): Promise<Asignacion> {
    const { cursoId, materiaId } = params;

    if (!cursoId || !materiaId) {
      throw new BadRequestException(
        'Debe enviar la combinacion cursoId y materiaId',
      );
    }

    const asignaciones = await this.asignacionRepository.find({
      where: { cursoId, materiaId },
      order: { idAsignacion: 'ASC' },
    });

    if (asignaciones.length === 0) {
      throw new NotFoundException(
        `No existe una asignacion para el curso ${cursoId} y la materia ${materiaId}`,
      );
    }

    return asignaciones[0];
  }

  private async findMateria(id: number): Promise<Materia> {
    const materia = await this.materiaRepository.findOne({
      where: { idMateria: id },
    });

    if (!materia) {
      throw new NotFoundException(`No se encontro la materia con id ${id}`);
    }

    return materia;
  }

  private async findPeriodo(id: number): Promise<Periodo> {
    const periodo = await this.periodoRepository.findOne({
      where: { idPeriodo: id },
    });

    if (!periodo) {
      throw new NotFoundException(`No se encontro el periodo con id ${id}`);
    }

    return periodo;
  }
}
