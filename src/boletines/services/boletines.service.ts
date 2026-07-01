import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { mkdir, writeFile } from 'fs/promises';
import { basename, extname, join } from 'path';
import { In, Repository } from 'typeorm';

import { Estudiante } from '../../estudiantes/entities/estudiante.entity';
import { Nota } from '../../notas/entities/nota.entity';
import { User } from '../../users/entities/user.entity';
import { GenerarBoletinesDto, PublicarBoletinesDto } from '../dto/boletin.dto';
import { Boletin, EstadoBoletin } from '../entities/boletin.entity';

export interface BoletinPublicadoResponse {
  id: number;
  estudianteId: number;
  periodoId: number;
  cursoId: number;
  archivoUrl: string | null;
  estado: EstadoBoletin;
  promedio: number | null;
  fechaGeneracion: Date | null;
}

@Injectable()
export class BoletinesService {
  constructor(
    @InjectRepository(Boletin)
    private readonly boletinRepository: Repository<Boletin>,

    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,

    @InjectRepository(Nota)
    private readonly notaRepository: Repository<Nota>,
  ) {}

  async findMine(user: User): Promise<Boletin[]> {
    const estudianteId = await this.findEstudianteIdByUser(user.id);

    return await this.boletinRepository.find({
      where: {
        estudianteId,
        estado: EstadoBoletin.PUBLICADO,
      },
      order: {
        periodoId: 'ASC',
        fechaGeneracion: 'DESC',
        id: 'ASC',
      },
    });
  }

  async findAcudidos(user: User): Promise<Boletin[]> {
    const estudianteIds = await this.findEstudianteIdsByAcudiente(user);
    if (!estudianteIds.length) return [];

    return this.boletinRepository.find({
      where: {
        estudianteId: In(estudianteIds),
        estado: EstadoBoletin.PUBLICADO,
      },
      order: {
        estudianteId: 'ASC',
        periodoId: 'ASC',
        fechaGeneracion: 'DESC',
      },
    });
  }

  async findAcudidoByPeriodo(
    user: User,
    estudianteId: number,
    periodoId: number,
  ): Promise<Boletin> {
    await this.assertEstudianteAsociado(user, estudianteId);
    const boletin = await this.boletinRepository.findOne({
      where: {
        estudianteId,
        periodoId,
        estado: EstadoBoletin.PUBLICADO,
      },
      order: { fechaGeneracion: 'DESC', id: 'DESC' },
    });
    if (!boletin) {
      throw new NotFoundException(
        `No se encontro boletin publicado para el periodo ${periodoId}`,
      );
    }
    return boletin;
  }

  async findAcudidoForDownload(
    user: User,
    estudianteId: number,
    boletinId: number,
  ): Promise<Boletin> {
    await this.assertEstudianteAsociado(user, estudianteId);
    const boletin = await this.boletinRepository.findOne({
      where: {
        id: boletinId,
        estudianteId,
        estado: EstadoBoletin.PUBLICADO,
      },
    });
    if (!boletin) {
      throw new NotFoundException(
        `No se encontro el boletin con id ${boletinId}`,
      );
    }
    return boletin;
  }

  async findMineByPeriodo(user: User, periodoId: number): Promise<Boletin> {
    const estudianteId = await this.findEstudianteIdByUser(user.id);
    const boletin = await this.boletinRepository.findOne({
      where: {
        estudianteId,
        periodoId,
        estado: EstadoBoletin.PUBLICADO,
      },
      order: {
        fechaGeneracion: 'DESC',
        id: 'DESC',
      },
    });

    if (!boletin) {
      throw new NotFoundException(
        `No se encontro boletin publicado para el periodo ${periodoId}`,
      );
    }

    return boletin;
  }

  async findMineForDownload(user: User, id: number): Promise<Boletin> {
    const estudianteId = await this.findEstudianteIdByUser(user.id);
    const boletin = await this.boletinRepository.findOne({
      where: {
        id,
        estudianteId,
        estado: EstadoBoletin.PUBLICADO,
      },
    });

    if (!boletin) {
      throw new NotFoundException(`No se encontro el boletin con id ${id}`);
    }

    return boletin;
  }

  async generar(
    user: User,
    generarBoletinesDto: GenerarBoletinesDto,
  ): Promise<Boletin[]> {
    this.validateAdminOrDocente(user);

    const { cursoId, periodoId, archivoUrl, rutaArchivo } = generarBoletinesDto;

    const estudiantes = await this.estudianteRepository
      .createQueryBuilder('estudiante')
      .innerJoin('estudiante.curso', 'curso')
      .where('curso.id = :cursoId', { cursoId })
      .select('estudiante.id', 'id')
      .getRawMany<{ id: string }>();

    if (estudiantes.length === 0) {
      throw new NotFoundException(
        `No se encontraron estudiantes para el curso ${cursoId}`,
      );
    }

    const promedios = await this.notaRepository
      .createQueryBuilder('nota')
      .select('nota.estudianteId', 'estudianteId')
      .addSelect('AVG(nota.valor)', 'promedio')
      .where('nota.cursoId = :cursoId', { cursoId })
      .andWhere('nota.periodo = :periodoId', { periodoId })
      .andWhere('nota.estudianteId IS NOT NULL')
      .groupBy('nota.estudianteId')
      .getRawMany<{ estudianteId: string; promedio: string }>();

    const promedioPorEstudiante = new Map(
      promedios.map(({ estudianteId, promedio }) => [
        Number(estudianteId),
        Number(Number(promedio).toFixed(2)),
      ]),
    );

    const fechaGeneracion = new Date();
    const boletines = await Promise.all(
      estudiantes.map(async ({ id: estudianteId }) => {
        const estudianteIdNumber = Number(estudianteId);
        const existente = await this.boletinRepository.findOne({
          where: {
            estudianteId: estudianteIdNumber,
            cursoId,
            periodoId,
          },
        });

        const data = {
          estudianteId: estudianteIdNumber,
          cursoId,
          periodoId,
          archivoUrl:
            archivoUrl ??
            existente?.archivoUrl ??
            `boletines/curso-${cursoId}/periodo-${periodoId}/estudiante-${estudianteIdNumber}.pdf`,
          rutaArchivo: rutaArchivo ?? existente?.rutaArchivo ?? null,
          estado: existente?.estado ?? EstadoBoletin.BORRADOR,
          promedio: promedioPorEstudiante.get(estudianteIdNumber) ?? null,
          fechaGeneracion,
        };

        return this.boletinRepository.save({
          ...existente,
          ...data,
        });
      }),
    );

    return boletines;
  }

  async publicarLote(
    user: User,
    publicarBoletinesDto: PublicarBoletinesDto,
    baseUrl: string,
  ): Promise<BoletinPublicadoResponse[]> {
    this.validateAdminOrDocente(user);

    const uploadDir = join(process.cwd(), 'uploads', 'boletines');
    await mkdir(uploadDir, { recursive: true });

    const fechaGeneracion = new Date();

    const boletines = await Promise.all(
      publicarBoletinesDto.boletines.map(async (item) => {
        const nombreArchivo = this.normalizeHtmlFileName(item.nombreArchivo);
        const rutaArchivo = join(uploadDir, nombreArchivo);
        const archivoUrl = `${baseUrl}/uploads/boletines/${encodeURIComponent(nombreArchivo)}`;

        await writeFile(rutaArchivo, item.html, 'utf8');

        const existente = await this.boletinRepository.findOne({
          where: {
            estudianteId: item.estudianteId,
            periodoId: item.periodoId,
            cursoId: item.cursoId,
          },
        });

        return await this.boletinRepository.save({
          ...existente,
          estudianteId: item.estudianteId,
          periodoId: item.periodoId,
          cursoId: item.cursoId,
          archivoUrl,
          rutaArchivo,
          estado: item.estado,
          promedio: item.promedio ?? null,
          metadata: item.metadata ?? null,
          fechaGeneracion,
        });
      }),
    );

    return boletines.map((boletin) => this.toPublicadoResponse(boletin));
  }

  async publicar(user: User, id: number): Promise<Boletin> {
    this.validateAdminOrDocente(user);

    const boletin = await this.boletinRepository.findOne({
      where: { id },
    });

    if (!boletin) {
      throw new NotFoundException(`No se encontro el boletin con id ${id}`);
    }

    boletin.estado = EstadoBoletin.PUBLICADO;

    return await this.boletinRepository.save(boletin);
  }

  private async findEstudianteIdByUser(userId: number): Promise<number> {
    const estudiante = await this.estudianteRepository.findOne({
      where: {
        user: {
          id: userId,
        },
      },
      relations: ['user'],
    });

    if (!estudiante) {
      throw new ForbiddenException('El usuario autenticado no es estudiante');
    }

    return estudiante.id;
  }

  private async findEstudianteIdsByAcudiente(user: User): Promise<number[]> {
    const roles =
      user.roles?.map((role) => String(role.name).trim().toUpperCase()) ?? [];
    if (!roles.includes('ACUDIENTE')) {
      throw new ForbiddenException('El usuario autenticado no es acudiente');
    }

    const estudiantes = await this.estudianteRepository.find({
      where: { acudientes: { id: user.id } },
      relations: ['acudientes'],
    });
    return estudiantes.map((estudiante) => estudiante.id);
  }

  private async assertEstudianteAsociado(user: User, estudianteId: number) {
    const ids = await this.findEstudianteIdsByAcudiente(user);
    if (!ids.includes(estudianteId)) {
      throw new ForbiddenException(
        'El estudiante no está asociado al acudiente',
      );
    }
  }

  private validateAdminOrDocente(user: User) {
    const roles =
      user.roles?.map((role) => String(role.name).toUpperCase()) ?? [];
    const autorizado = roles.some((role) =>
      ['ADMIN', 'ADMINISTRADOR', 'DOCENTE'].includes(role),
    );

    if (!autorizado) {
      throw new ForbiddenException(
        'Solo administradores o docentes pueden realizar esta accion',
      );
    }
  }

  private normalizeHtmlFileName(nombreArchivo: string): string {
    const baseName = basename(nombreArchivo)
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9._-]/g, '');
    const extension = extname(baseName).toLowerCase();
    const nameWithoutExtension = extension
      ? baseName.slice(0, -extension.length)
      : baseName;

    return `${nameWithoutExtension || `boletin-${Date.now()}`}.html`;
  }

  private toPublicadoResponse(boletin: Boletin): BoletinPublicadoResponse {
    return {
      id: boletin.id,
      estudianteId: boletin.estudianteId,
      periodoId: boletin.periodoId,
      cursoId: boletin.cursoId,
      archivoUrl: boletin.archivoUrl,
      estado: boletin.estado,
      promedio: boletin.promedio,
      fechaGeneracion: boletin.fechaGeneracion,
    };
  }
}
