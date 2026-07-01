import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

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
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createObservadorDto: CreateObservadorDto,
    usuarioId: number,
  ): Promise<Observador> {
    await this.assertPuedeGestionar(usuarioId);
    const observador = this.observadorRepository.create({
      ...createObservadorDto,
      fecha: new Date(createObservadorDto.fecha),
    });

    return await this.observadorRepository.save(observador);
  }

  async findAll(usuarioId: number): Promise<Observador[]> {
    const contexto = await this.getContexto(usuarioId);
    if (contexto.puedeGestionar) {
      return await this.observadorRepository.find({
        order: { idObservador: 'ASC' },
      });
    }

    if (!contexto.estudianteIds.length) {
      return [];
    }

    return await this.observadorRepository.find({
      where: { estudianteId: In(contexto.estudianteIds) },
      order: { idObservador: 'ASC' },
    });
  }

  async findOne(id: number, usuarioId: number): Promise<Observador> {
    const observador = await this.observadorRepository.findOne({
      where: { idObservador: id },
    });

    if (!observador) {
      throw new NotFoundException(`No se encontro el observador con id ${id}`);
    }

    const contexto = await this.getContexto(usuarioId);
    if (
      !contexto.puedeGestionar &&
      !contexto.estudianteIds.includes(observador.estudianteId)
    ) {
      throw new ForbiddenException(
        'No puede consultar observaciones de este estudiante',
      );
    }

    return observador;
  }

  async update(
    id: number,
    updateObservadorDto: UpdateObservadorDto,
    usuarioId: number,
  ): Promise<Observador> {
    await this.assertPuedeGestionar(usuarioId);
    const observador = await this.findOneInternal(id);

    Object.assign(observador, {
      ...updateObservadorDto,
      fecha: updateObservadorDto.fecha
        ? new Date(updateObservadorDto.fecha)
        : observador.fecha,
    });

    return await this.observadorRepository.save(observador);
  }

  async remove(id: number, usuarioId: number): Promise<Observador> {
    await this.assertPuedeGestionar(usuarioId);
    const observador = await this.findOneInternal(id);

    return await this.observadorRepository.remove(observador);
  }

  private async findOneInternal(id: number): Promise<Observador> {
    const observador = await this.observadorRepository.findOne({
      where: { idObservador: id },
    });
    if (!observador) {
      throw new NotFoundException(`No se encontro el observador con id ${id}`);
    }
    return observador;
  }

  private async assertPuedeGestionar(usuarioId: number) {
    if (!(await this.getContexto(usuarioId)).puedeGestionar) {
      throw new ForbiddenException(
        'El acudiente solo puede consultar observaciones',
      );
    }
  }

  private async getContexto(usuarioId: number) {
    const usuario = await this.userRepository.findOne({
      where: { id: usuarioId },
      relations: ['roles', 'estudiante', 'acudidos'],
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const roles =
      usuario.roles?.map((role) => String(role.name).trim().toUpperCase()) ??
      [];
    const puedeGestionar = roles.some((role) =>
      ['ADMIN', 'ADMINISTRADOR', 'DOCENTE'].includes(role),
    );
    const estudianteIds = [
      ...(usuario.estudiante ? [usuario.estudiante.id] : []),
      ...(usuario.acudidos?.map((estudiante) => estudiante.id) ?? []),
    ];

    return { puedeGestionar, estudianteIds };
  }
}
