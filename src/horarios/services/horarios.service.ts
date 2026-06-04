import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';

import { Asignacion } from 'src/asignaciones/entities/asignacione.entity';
import { CreateHorarioDto } from '../dto/create-horario.dto';
import { UpdateHorarioDto } from '../dto/update-horario.dto';
import { DiaHorario, Horario } from '../entities/horario.entity';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horario)
    private readonly horarioRepository: Repository<Horario>,

    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
  ) {}

  async create(createHorarioDto: CreateHorarioDto): Promise<Horario> {
    const asignacion = await this.findAsignacion(createHorarioDto.asignacionId);

    this.validateRangoHoras(
      createHorarioDto.horaInicio,
      createHorarioDto.horaFin,
    );
    await this.validateConflictos({
      dia: createHorarioDto.dia,
      horaInicio: createHorarioDto.horaInicio,
      horaFin: createHorarioDto.horaFin,
      asignacion,
    });

    const horario = this.horarioRepository.create({
      ...createHorarioDto,
      asignacion,
    });

    return await this.horarioRepository.save(horario);
  }

  async findAll(): Promise<Horario[]> {
    return await this.horarioRepository.find({
      relations: [
        'asignacion',
        'asignacion.curso',
        'asignacion.materia',
        'asignacion.docente',
      ],
      order: {
        idHorario: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Horario> {
    const horario = await this.horarioRepository.findOne({
      where: { idHorario: id },
      relations: [
        'asignacion',
        'asignacion.curso',
        'asignacion.materia',
        'asignacion.docente',
      ],
    });

    if (!horario) {
      throw new NotFoundException(`No se encontro el horario con id ${id}`);
    }

    return horario;
  }

  async update(
    id: number,
    updateHorarioDto: UpdateHorarioDto,
  ): Promise<Horario> {
    const horario = await this.findOne(id);
    const asignacionId = updateHorarioDto.asignacionId ?? horario.asignacionId;
    const asignacion = await this.findAsignacion(asignacionId);
    const dia = updateHorarioDto.dia ?? horario.dia;
    const horaInicio = updateHorarioDto.horaInicio ?? horario.horaInicio;
    const horaFin = updateHorarioDto.horaFin ?? horario.horaFin;

    this.validateRangoHoras(horaInicio, horaFin);
    await this.validateConflictos({
      dia,
      horaInicio,
      horaFin,
      asignacion,
      horarioId: horario.idHorario,
    });

    Object.assign(horario, {
      dia,
      horaInicio,
      horaFin,
      asignacionId,
      asignacion,
    });

    return await this.horarioRepository.save(horario);
  }

  async remove(id: number): Promise<Horario> {
    const horario = await this.findOne(id);

    return await this.horarioRepository.remove(horario);
  }

  private async findAsignacion(id: number): Promise<Asignacion> {
    const asignacion = await this.asignacionRepository.findOne({
      where: { idAsignacion: id },
    });

    if (!asignacion) {
      throw new NotFoundException(`No se encontro la asignacion con id ${id}`);
    }

    return asignacion;
  }

  private validateRangoHoras(horaInicio: string, horaFin: string) {
    if (this.toMinutes(horaInicio) >= this.toMinutes(horaFin)) {
      throw new BadRequestException(
        'La hora de inicio debe ser menor que la hora de fin',
      );
    }
  }

  private async validateConflictos(params: {
    dia: DiaHorario;
    horaInicio: string;
    horaFin: string;
    asignacion: Asignacion;
    horarioId?: number;
  }) {
    const horarios = await this.horarioRepository.find({
      where: {
        dia: params.dia,
        ...(params.horarioId ? { idHorario: Not(params.horarioId) } : {}),
      },
      relations: ['asignacion'],
    });

    const nuevoInicio = this.toMinutes(params.horaInicio);
    const nuevoFin = this.toMinutes(params.horaFin);

    for (const horario of horarios) {
      const hayCruce =
        nuevoInicio < this.toMinutes(horario.horaFin) &&
        nuevoFin > this.toMinutes(horario.horaInicio);

      if (!hayCruce) {
        continue;
      }

      if (horario.asignacionId === params.asignacion.idAsignacion) {
        throw new BadRequestException(
          'Ya existe un horario para esta asignacion en el mismo dia y bloque de hora',
        );
      }

      if (horario.asignacion.docenteId === params.asignacion.docenteId) {
        throw new BadRequestException(
          'El docente ya tiene un horario en el mismo dia y bloque de hora',
        );
      }

      if (horario.asignacion.cursoId === params.asignacion.cursoId) {
        throw new BadRequestException(
          'El curso ya tiene un horario en el mismo dia y bloque de hora',
        );
      }
    }
  }

  private toMinutes(value: string): number {
    const [hours, minutes] = value.split(':').map(Number);

    return hours * 60 + minutes;
  }
}
