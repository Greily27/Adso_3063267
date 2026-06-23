import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { LessThan, MoreThan, Not, Repository } from 'typeorm';
import {
  CreateReservaAuditorioDto,
  UpdateReservaAuditorioDto,
} from '../dto/reserva-auditorio.dto';
import { Auditorio } from '../entities/auditorio.entity';
import { ReservaAuditorio } from '../entities/reserva-auditorio.entity';

@Injectable()
export class ReservasAuditorioService {
  constructor(
    @InjectRepository(ReservaAuditorio)
    private readonly reservaRepository: Repository<ReservaAuditorio>,

    @InjectRepository(Auditorio)
    private readonly auditorioRepository: Repository<Auditorio>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createReservaDto: CreateReservaAuditorioDto,
  ): Promise<ReservaAuditorio> {
    const usuario = await this.findUsuario(createReservaDto.idusuario);
    const auditorio = await this.findAuditorio(createReservaDto.idauditorio);
    const fecha_hora = new Date(createReservaDto.fecha_hora);
    const fecha_hora_fin = new Date(createReservaDto.fecha_hora_fin);

    this.validateRangoFechas(fecha_hora, fecha_hora_fin);

    await this.validateDisponibilidad({
      idusuario: usuario.id,
      idauditorio: auditorio.idauditorio,
      fecha_hora,
      fecha_hora_fin,
    });

    const reserva = this.reservaRepository.create({
      ...createReservaDto,
      fecha_hora,
      fecha_hora_fin,
      usuario,
      auditorio,
      idasignacion: createReservaDto.idasignacion ?? null,
    });

    return await this.reservaRepository.save(reserva);
  }

  async findAll(): Promise<ReservaAuditorio[]> {
    return await this.reservaRepository.find({
      relations: ['usuario', 'auditorio'],
      order: {
        idreserva: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<ReservaAuditorio> {
    const reserva = await this.reservaRepository.findOne({
      where: { idreserva: id },
      relations: ['usuario', 'auditorio'],
    });

    if (!reserva) {
      throw new NotFoundException(`No se encontro la reserva con id ${id}`);
    }

    return reserva;
  }

  async update(
    id: number,
    updateReservaDto: UpdateReservaAuditorioDto,
  ): Promise<ReservaAuditorio> {
    const reserva = await this.findOne(id);
    const idusuario = updateReservaDto.idusuario ?? reserva.idusuario;
    const idauditorio = updateReservaDto.idauditorio ?? reserva.idauditorio;
    const fecha_hora = updateReservaDto.fecha_hora
      ? new Date(updateReservaDto.fecha_hora)
      : reserva.fecha_hora;
    const fecha_hora_fin = updateReservaDto.fecha_hora_fin
      ? new Date(updateReservaDto.fecha_hora_fin)
      : reserva.fecha_hora_fin;
    const idasignacion =
      updateReservaDto.idasignacion !== undefined
        ? updateReservaDto.idasignacion
        : reserva.idasignacion;

    const usuario = await this.findUsuario(idusuario);
    const auditorio = await this.findAuditorio(idauditorio);

    this.validateRangoFechas(fecha_hora, fecha_hora_fin);

    await this.validateDisponibilidad({
      idusuario: usuario.id,
      idauditorio: auditorio.idauditorio,
      fecha_hora,
      fecha_hora_fin,
      idreserva: reserva.idreserva,
    });

    Object.assign(reserva, {
      idusuario,
      idauditorio,
      fecha_hora,
      fecha_hora_fin,
      idasignacion: idasignacion ?? null,
      usuario,
      auditorio,
    });

    return await this.reservaRepository.save(reserva);
  }

  async remove(id: number): Promise<ReservaAuditorio> {
    const reserva = await this.findOne(id);

    return await this.reservaRepository.remove(reserva);
  }

  private async findUsuario(id: number): Promise<User> {
    const usuario = await this.userRepository.findOne({
      where: { id },
    });

    if (!usuario) {
      throw new NotFoundException(`No se encontro el usuario con id ${id}`);
    }

    return usuario;
  }

  private async findAuditorio(id: number): Promise<Auditorio> {
    const auditorio = await this.auditorioRepository.findOne({
      where: { idauditorio: id },
    });

    if (!auditorio) {
      throw new NotFoundException(`No se encontro el auditorio con id ${id}`);
    }

    return auditorio;
  }

  private async validateDisponibilidad(params: {
    idusuario: number;
    idauditorio: number;
    fecha_hora: Date;
    fecha_hora_fin: Date;
    idreserva?: number;
  }): Promise<void> {
    const reservas = await this.reservaRepository.find({
      where: [
        {
          idauditorio: params.idauditorio,
          fecha_hora: LessThan(params.fecha_hora_fin),
          fecha_hora_fin: MoreThan(params.fecha_hora),
          ...(params.idreserva ? { idreserva: Not(params.idreserva) } : {}),
        },
        {
          idusuario: params.idusuario,
          fecha_hora: LessThan(params.fecha_hora_fin),
          fecha_hora_fin: MoreThan(params.fecha_hora),
          ...(params.idreserva ? { idreserva: Not(params.idreserva) } : {}),
        },
      ],
    });

    const auditorioOcupado = reservas.some(
      (reserva) => reserva.idauditorio === params.idauditorio,
    );

    if (auditorioOcupado) {
      throw new BadRequestException(
        'El auditorio ya tiene una reserva cruzada en ese rango horario',
      );
    }

    const usuarioOcupado = reservas.some(
      (reserva) => reserva.idusuario === params.idusuario,
    );

    if (usuarioOcupado) {
      throw new BadRequestException(
        'El usuario ya tiene una reserva cruzada en ese rango horario',
      );
    }
  }

  private validateRangoFechas(fechaInicio: Date, fechaFin: Date): void {
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha y hora de fin debe ser mayor que la fecha y hora de inicio',
      );
    }
  }
}
