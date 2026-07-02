import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createHorarioDto: CreateHorarioDto,
    usuarioId: number,
  ): Promise<Horario> {
    await this.assertPuedeGestionar(usuarioId);
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

  async findAll(usuarioId: number): Promise<Horario[]> {
    const usuario = await this.findUsuario(usuarioId);
    const roles = this.getRoles(usuario);
    const where =
      roles.includes('ACUDIENTE') ||
      roles.some((role) => this.isHorarioManagerRole(role))
        ? {}
        : roles.includes('DOCENTE')
          ? { asignacion: { docenteId: usuario.id } }
          : {
              asignacion: {
                cursoId:
                  usuario.estudiante?.curso?.id ??
                  usuario.acudidos?.[0]?.curso?.id ??
                  -1,
              },
            };

    const horarios = await this.horarioRepository.find({
      where,
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

    if (roles.includes('ACUDIENTE')) {
      const cursos = new Set(
        usuario.acudidos?.map((estudiante) => estudiante.curso?.id) ?? [],
      );
      return horarios.filter((horario) =>
        cursos.has(horario.asignacion.cursoId),
      );
    }

    return horarios;
  }

  async findOne(id: number, usuarioId: number): Promise<Horario> {
    const horario = (await this.findAll(usuarioId)).find(
      (item) => item.idHorario === id,
    );
    if (!horario) {
      throw new NotFoundException(`No se encontro el horario con id ${id}`);
    }

    return horario;
  }

  async update(
    id: number,
    updateHorarioDto: UpdateHorarioDto,
    usuarioId: number,
  ): Promise<Horario> {
    await this.assertPuedeGestionar(usuarioId);
    const horario = await this.findOneInternal(id);
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

  async remove(id: number, usuarioId: number): Promise<Horario> {
    await this.assertPuedeGestionar(usuarioId);
    const horario = await this.findOneInternal(id);

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

  private async findOneInternal(id: number) {
    const horario = await this.horarioRepository.findOne({
      where: { idHorario: id },
      relations: ['asignacion'],
    });
    if (!horario) {
      throw new NotFoundException(`No se encontro el horario con id ${id}`);
    }
    return horario;
  }

  private async findUsuario(id: number) {
    const usuario = await this.userRepository.findOne({
      where: { id },
      relations: [
        'roles',
        'estudiante',
        'estudiante.curso',
        'acudidos',
        'acudidos.curso',
      ],
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  private getRoles(usuario: User): string[] {
    return (
      usuario.roles?.map((role) => this.normalizeRoleName(role.name)) ?? []
    );
  }

  private async assertPuedeGestionar(usuarioId: number) {
    const roles = this.getRoles(await this.findUsuario(usuarioId));
    if (!roles.some((role) => this.isHorarioManagerRole(role))) {
      throw new ForbiddenException(
        'Tu rol solo tiene permiso para consultar horarios',
      );
    }
  }

  private isHorarioManagerRole(role: string): boolean {
    return [
      'ADMIN',
      'ADMINISTRADOR',
      'AUXADMINISTRATIVO',
      'AUXILIARADMINISTRATIVO',
    ].includes(role);
  }

  private normalizeRoleName(roleName: unknown): string {
    return String(roleName)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase();
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
