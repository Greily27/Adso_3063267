import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateEventoDto, UpdateEventoDto } from '../dto/evento.dto';
import {
  DestinatarioEvento,
  EstadoEvento,
  Evento,
} from '../entities/evento.entity';

@Injectable()
export class EventosService {
  private readonly rolesEditores = [
    'ADMIN',
    'ADMINISTRADOR',
    'AUXILIAR ADMINISTRATIVO',
    'AUXILIAR_ADMINISTRATIVO',
  ];

  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    dto: CreateEventoDto,
    imagenUrl: string | undefined,
    usuarioId: number,
  ) {
    const usuario = await this.findUsuarioConContexto(usuarioId);
    this.assertPuedeEditar(usuario);
    this.validateDates(dto.fechaInicio, dto.fechaFin);

    const evento = this.eventoRepository.create({
      ...dto,
      fechaInicio: new Date(dto.fechaInicio),
      fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
      imagenUrl: imagenUrl ?? null,
      creadoPor: usuario,
      creadoPorId: usuario.id,
    });

    const saved = await this.eventoRepository.save(evento);
    return this.findOneForEditor(saved.id);
  }

  async findAll(usuarioId: number) {
    const usuario = await this.findUsuarioConContexto(usuarioId);
    if (this.puedeEditar(usuario)) {
      return this.eventoRepository.find({
        order: { fechaInicio: 'DESC' },
      });
    }

    const destinatario = this.getDestinatario(usuario);
    return this.eventoRepository
      .createQueryBuilder('evento')
      .where('evento.estado = :estado', { estado: EstadoEvento.PUBLICADO })
      .andWhere(':destinatario = ANY(evento.destinatarios)', { destinatario })
      .orderBy('evento.fechaInicio', 'DESC')
      .getMany();
  }

  async findOne(id: number, usuarioId: number) {
    const eventos = await this.findAll(usuarioId);
    const evento = eventos.find((item) => item.id === id);
    if (!evento) {
      throw new NotFoundException('Evento no encontrado o no disponible');
    }
    return evento;
  }

  async update(
    id: number,
    dto: UpdateEventoDto,
    imagenUrl: string | undefined,
    usuarioId: number,
  ) {
    const usuario = await this.findUsuarioConContexto(usuarioId);
    this.assertPuedeEditar(usuario);
    const evento = await this.findOneForEditor(id);

    const fechaInicio = dto.fechaInicio ?? evento.fechaInicio.toISOString();
    const fechaFin =
      dto.fechaFin === undefined
        ? evento.fechaFin?.toISOString()
        : dto.fechaFin;
    this.validateDates(fechaInicio, fechaFin);

    Object.assign(evento, dto);
    if (dto.fechaInicio) evento.fechaInicio = new Date(dto.fechaInicio);
    if (dto.fechaFin) evento.fechaFin = new Date(dto.fechaFin);

    if (imagenUrl) {
      await this.removeLocalImage(evento.imagenUrl);
      evento.imagenUrl = imagenUrl;
    }

    await this.eventoRepository.save(evento);
    return this.findOneForEditor(id);
  }

  async cancel(id: number, usuarioId: number) {
    const usuario = await this.findUsuarioConContexto(usuarioId);
    this.assertPuedeEditar(usuario);
    const evento = await this.findOneForEditor(id);
    evento.estado = EstadoEvento.CANCELADO;
    return this.eventoRepository.save(evento);
  }

  private async findOneForEditor(id: number) {
    const evento = await this.eventoRepository.findOne({
      where: { id },
    });
    if (!evento) throw new NotFoundException('Evento no encontrado');
    return evento;
  }

  private async findUsuarioConContexto(id: number) {
    const usuario = await this.userRepository.findOne({
      where: { id },
      relations: [
        'roles',
        'cursos',
        'estudiante',
        'estudiante.curso',
        'acudidos',
        'acudidos.curso',
      ],
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  private puedeEditar(usuario: User) {
    return usuario.roles?.some((role) =>
      this.rolesEditores.includes(String(role.name).trim().toUpperCase()),
    );
  }

  private assertPuedeEditar(usuario: User) {
    if (!this.puedeEditar(usuario)) {
      throw new ForbiddenException(
        'Solo el administrador o el auxiliar administrativo pueden gestionar eventos',
      );
    }
  }

  private getDestinatario(usuario: User): DestinatarioEvento {
    const roles =
      usuario.roles?.map((role) => String(role.name).toUpperCase()) ?? [];
    if (roles.some((role) => role === 'DOCENTE')) {
      return DestinatarioEvento.DOCENTE;
    }
    if (roles.some((role) => ['ACUDIENTE'].includes(role))) {
      return DestinatarioEvento.ACUDIENTE;
    }
    if (roles.some((role) => role === 'ESTUDIANTE')) {
      return DestinatarioEvento.ESTUDIANTE;
    }
    throw new ForbiddenException(
      'El rol del usuario no puede consultar eventos',
    );
  }

  private validateDates(fechaInicio: string, fechaFin?: string | null) {
    if (fechaFin && new Date(fechaFin) < new Date(fechaInicio)) {
      throw new BadRequestException(
        'La fecha de finalización no puede ser anterior a la fecha de inicio',
      );
    }
  }

  private async removeLocalImage(imagenUrl: string | null) {
    if (!imagenUrl) return;
    const marker = '/uploads/eventos/';
    const index = imagenUrl.indexOf(marker);
    if (index === -1) return;
    const filename = basename(
      decodeURIComponent(imagenUrl.slice(index + marker.length)),
    );
    try {
      await unlink(join(process.cwd(), 'uploads', 'eventos', filename));
    } catch {
      return;
    }
  }
}
