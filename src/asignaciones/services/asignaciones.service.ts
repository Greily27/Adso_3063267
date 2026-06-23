import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Curso } from 'src/cursos/entities/curso.entity';
import { CreateAsignacioneDto } from '../dtos/create-asignacione.dto';
import { UpdateAsignacioneDto } from '../dtos/update-asignacione.dto';
import { Asignacion } from '../entities/asignacione.entity';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,

    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  async create(createAsignacioneDto: CreateAsignacioneDto) {
    const { cursoId, materiaId, docenteId } = createAsignacioneDto;
    const curso = await this.findCurso(cursoId);

    const asignacionExistente = await this.asignacionRepository.findOne({
      where: { cursoId, materiaId, docenteId },
    });

    if (asignacionExistente) {
      throw new BadRequestException(
        'Ya existe esta asignacion para el curso, materia y docente',
      );
    }

    const asignacion = this.asignacionRepository.create({
      cursoId,
      materiaId,
      docenteId,
      curso,
    });

    return await this.asignacionRepository.save(asignacion);
  }

  async createManyForCurso(
    cursoId: number,
    asignaciones: Array<Pick<CreateAsignacioneDto, 'materiaId' | 'docenteId'>>,
  ) {
    this.validateAsignacionesDuplicadas(asignaciones);

    const creadas: Asignacion[] = [];

    for (const asignacion of asignaciones) {
      creadas.push(
        await this.create({
          cursoId,
          materiaId: asignacion.materiaId,
          docenteId: asignacion.docenteId,
        }),
      );
    }

    return creadas;
  }

  async replaceForCurso(
    cursoId: number,
    asignaciones: Array<Pick<CreateAsignacioneDto, 'materiaId' | 'docenteId'>>,
  ) {
    await this.findCurso(cursoId);
    this.validateAsignacionesDuplicadas(asignaciones);
    await this.asignacionRepository.delete({ cursoId });

    return await this.createManyForCurso(cursoId, asignaciones);
  }

  async findAll() {
    return await this.asignacionRepository.find({
      relations: ['curso'],
      order: {
        idAsignacion: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const asignacion = await this.asignacionRepository.findOne({
      where: { idAsignacion: id },
      relations: ['curso'],
    });

    if (!asignacion) {
      throw new NotFoundException(`No se encontro la asignacion con id ${id}`);
    }

    return asignacion;
  }

  async update(id: number, updateAsignacioneDto: UpdateAsignacioneDto) {
    const asignacion = await this.findOne(id);
    const cursoId = updateAsignacioneDto.cursoId ?? asignacion.cursoId;
    const materiaId = updateAsignacioneDto.materiaId ?? asignacion.materiaId;
    const docenteId = updateAsignacioneDto.docenteId ?? asignacion.docenteId;
    const curso = await this.findCurso(cursoId);

    const asignacionExistente = await this.asignacionRepository.findOne({
      where: { cursoId, materiaId, docenteId },
    });

    if (
      asignacionExistente &&
      asignacionExistente.idAsignacion !== asignacion.idAsignacion
    ) {
      throw new BadRequestException(
        'Ya existe esta asignacion para el curso, materia y docente',
      );
    }

    Object.assign(asignacion, {
      cursoId,
      materiaId,
      docenteId,
      curso,
    });

    return await this.asignacionRepository.save(asignacion);
  }

  async remove(id: number) {
    const asignacion = await this.findOne(id);

    return await this.asignacionRepository.remove(asignacion);
  }

  private async findCurso(id: number) {
    const curso = await this.cursoRepository.findOne({
      where: { id, isActive: true },
    });

    if (!curso) {
      throw new NotFoundException(`No se encontro el curso con id ${id}`);
    }

    return curso;
  }

  private validateAsignacionesDuplicadas(
    asignaciones: Array<Pick<CreateAsignacioneDto, 'materiaId' | 'docenteId'>>,
  ) {
    const asignacionesUnicas = new Set(
      asignaciones.map(
        (asignacion) => `${asignacion.materiaId}-${asignacion.docenteId}`,
      ),
    );

    if (asignacionesUnicas.size !== asignaciones.length) {
      throw new BadRequestException(
        'No se pueden repetir asignaciones con la misma materia y docente',
      );
    }
  }
}
