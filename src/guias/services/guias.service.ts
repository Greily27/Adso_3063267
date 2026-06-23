import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import { basename, join } from 'path';
import { Repository } from 'typeorm';

import { Asignacion } from 'src/asignaciones/entities/asignacione.entity';
import { CreateGuiaDto } from '../dto/create-guia.dto';
import { UpdateGuiaDto } from '../dto/update-guia.dto';
import { Guia } from '../entities/guia.entity';

@Injectable()
export class GuiasService {
  constructor(
    @InjectRepository(Guia)
    private readonly guiaRepository: Repository<Guia>,

    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
  ) {}

  async create(
    createGuiaDto: CreateGuiaDto,
    archivoUrl: string,
  ): Promise<Guia> {
    if (!archivoUrl) {
      throw new BadRequestException(
        'Debe enviar un archivo en el campo archivo',
      );
    }

    const data = this.normalizeCreatePayload(createGuiaDto);
    const asignacion = await this.findAsignacion(data.asignacionId);
    const guia = this.guiaRepository.create({
      ...data,
      archivoUrl,
      asignacion,
    });

    return await this.guiaRepository.save(guia);
  }

  async findAll(): Promise<Guia[]> {
    return await this.guiaRepository.find({
      relations: [
        'asignacion',
        'asignacion.curso',
        'asignacion.materia',
        'asignacion.docente',
      ],
      order: {
        idGuia: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Guia> {
    const guia = await this.guiaRepository.findOne({
      where: { idGuia: id },
      relations: [
        'asignacion',
        'asignacion.curso',
        'asignacion.materia',
        'asignacion.docente',
      ],
    });

    if (!guia) {
      throw new NotFoundException(`No se encontro la guia con id ${id}`);
    }

    return guia;
  }

  async update(
    id: number,
    updateGuiaDto: UpdateGuiaDto,
    archivoUrl?: string,
  ): Promise<Guia> {
    const guia = await this.findOne(id);
    const data = this.normalizeUpdatePayload(updateGuiaDto);

    if (data.asignacionId !== undefined) {
      guia.asignacion = await this.findAsignacion(data.asignacionId);
      guia.asignacionId = data.asignacionId;
    }

    if (data.nombreGuia !== undefined) {
      guia.nombreGuia = data.nombreGuia;
    }

    if (data.descripcion !== undefined) {
      guia.descripcion = data.descripcion;
    }

    if (data.estado !== undefined) {
      guia.estado = data.estado;
    }

    if (archivoUrl) {
      await this.removeLocalFile(guia.archivoUrl);
      guia.archivoUrl = archivoUrl;
    }

    await this.guiaRepository.save(guia);

    return await this.findOne(id);
  }

  async remove(id: number): Promise<Guia> {
    const guia = await this.findOne(id);
    guia.estado = false;

    return await this.guiaRepository.save(guia);
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

  private normalizeCreatePayload(payload: CreateGuiaDto) {
    const nombreGuia = this.normalizeRequiredString(
      payload.nombreGuia,
      'nombreGuia',
    );
    const descripcion = this.normalizeRequiredString(
      payload.descripcion,
      'descripcion',
    );
    const asignacionId = this.normalizeRequiredNumber(
      payload.asignacionId,
      'asignacionId',
    );
    const estado =
      payload.estado === undefined
        ? true
        : this.normalizeBoolean(payload.estado, 'estado');

    return {
      nombreGuia,
      descripcion,
      estado,
      asignacionId,
    };
  }

  private normalizeUpdatePayload(payload: UpdateGuiaDto) {
    return {
      nombreGuia:
        payload.nombreGuia === undefined
          ? undefined
          : this.normalizeRequiredString(payload.nombreGuia, 'nombreGuia'),
      descripcion:
        payload.descripcion === undefined
          ? undefined
          : this.normalizeRequiredString(payload.descripcion, 'descripcion'),
      estado:
        payload.estado === undefined
          ? undefined
          : this.normalizeBoolean(payload.estado, 'estado'),
      asignacionId:
        payload.asignacionId === undefined
          ? undefined
          : this.normalizeRequiredNumber(payload.asignacionId, 'asignacionId'),
    };
  }

  private normalizeRequiredString(value: unknown, field: string): string {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new BadRequestException(`El campo ${field} es obligatorio`);
    }

    return value.trim();
  }

  private normalizeRequiredNumber(value: unknown, field: string): number {
    const normalized = Number(value);

    if (!Number.isInteger(normalized) || normalized <= 0) {
      throw new BadRequestException(`El campo ${field} debe ser un numero`);
    }

    return normalized;
  }

  private normalizeBoolean(value: unknown, field: string): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (['true', '1', 'si'].includes(normalized)) {
        return true;
      }

      if (['false', '0', 'no'].includes(normalized)) {
        return false;
      }
    }

    throw new BadRequestException(`El campo ${field} debe ser booleano`);
  }

  private async removeLocalFile(archivoUrl: string) {
    const marker = '/uploads/guias/';
    const markerIndex = archivoUrl.indexOf(marker);

    if (markerIndex === -1) {
      return;
    }

    const filename = decodeURIComponent(
      archivoUrl.slice(markerIndex + marker.length),
    );
    const filePath = join(
      process.cwd(),
      'uploads',
      'guias',
      basename(filename),
    );

    try {
      await unlink(filePath);
    } catch {
      return;
    }
  }
}
