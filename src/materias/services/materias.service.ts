import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Curso } from '../../cursos/entities/curso.entity';
import { CreateMateriaDto, UpdateMateriaDto } from '../dto/materia.dto';
import { Materia } from '../entities/materia.entity';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class MateriasService {
  constructor(
    @InjectRepository(Materia)
    private readonly materiaRepository: Repository<Materia>,

    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createMateriaDto: CreateMateriaDto): Promise<Materia> {
    const { cursosIds, docenteId, docenteIds, ...data } = createMateriaDto;

    const existeMateria = await this.materiaRepository.findOne({
      where: { nombreMateria: data.nombreMateria },
    });

    if (existeMateria) {
      throw new BadRequestException('Ya existe una materia con ese nombre');
    }

    let cursos: Curso[] = [];

    if (cursosIds && cursosIds.length > 0) {
      cursos = await this.cursoRepository.find({
        where: {
          id: In(cursosIds),
        },
      });

      if (cursos.length !== cursosIds.length) {
        throw new NotFoundException('Uno o varios cursos no existen');
      }
    }

    const docentes = await this.findDocentesAsignables(
      this.normalizarDocenteIds(docenteId, docenteIds),
    );

    const materia = this.materiaRepository.create({
      ...data,
      estado: data.estado ?? true,
      cursos,
    });

    const savedMateria = await this.materiaRepository.save(materia);
    await this.syncMateriaDocentes(savedMateria.idMateria, docentes);

    return await this.findOne(savedMateria.idMateria);
  }

  async findAll(): Promise<Materia[]> {
    return await this.materiaRepository.find({
      relations: ['cursos', 'docentes', 'docentes.roles'],
      order: {
        idMateria: 'ASC',
      },
    });
  }

  async findOne(id: number): Promise<Materia> {
    const materia = await this.materiaRepository.findOne({
      where: { idMateria: id },
      relations: ['cursos', 'docentes', 'docentes.roles'],
    });

    if (!materia) {
      throw new NotFoundException(`No se encontro la materia con id ${id}`);
    }

    return materia;
  }

  async update(
    id: number,
    updateMateriaDto: UpdateMateriaDto,
  ): Promise<Materia> {
    const materia = await this.findOne(id);
    const { cursosIds, docenteId, docenteIds, ...data } = updateMateriaDto;

    if (data.nombreMateria && data.nombreMateria !== materia.nombreMateria) {
      const existeMateria = await this.materiaRepository.findOne({
        where: { nombreMateria: data.nombreMateria },
      });

      if (existeMateria) {
        throw new BadRequestException('Ya existe otra materia con ese nombre');
      }
    }

    if (cursosIds) {
      const cursos = await this.cursoRepository.find({
        where: {
          id: In(cursosIds),
        },
      });

      if (cursos.length !== cursosIds.length) {
        throw new NotFoundException('Uno o varios cursos no existen');
      }

      materia.cursos = cursos;
    }

    if (docenteId !== undefined || docenteIds !== undefined) {
      const docentes = await this.findDocentesAsignables(
        this.normalizarDocenteIds(docenteId, docenteIds),
      );
      materia.docentes = docentes;
      await this.syncMateriaDocentes(materia.idMateria, docentes);
    }

    Object.assign(materia, data);

    return await this.materiaRepository.save(materia);
  }

  async remove(id: number): Promise<Materia> {
    const materia = await this.materiaRepository.findOne({
      where: { idMateria: id },
      relations: ['cursos', 'docentes', 'notas'],
    });

    if (!materia) {
      throw new NotFoundException(`No se encontro la materia con id ${id}`);
    }

    if (materia.notas?.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar la materia porque tiene notas registradas',
      );
    }

    await this.materiaRepository.manager.transaction(async (manager) => {
      await manager.query(`DELETE FROM "asignaciones" WHERE "materiaId" = $1`, [
        id,
      ]);
      await manager.query(
        `DELETE FROM "docente_materia" WHERE "materiasIdMateria" = $1`,
        [id],
      );
      await manager.query(
        `DELETE FROM "curso_materia" WHERE "materiasIdMateria" = $1`,
        [id],
      );
      await manager.remove(Materia, materia);
    });

    return materia;
  }

  private normalizarDocenteIds(
    docenteId?: number,
    docenteIds?: number[],
  ): number[] {
    const ids = docenteIds ?? (docenteId ? [docenteId] : []);
    return [...new Set(ids)];
  }

  private async findDocentesAsignables(docenteIds: number[]): Promise<User[]> {
    if (docenteIds.length === 0) {
      return [];
    }

    const docentes = await this.userRepository.find({
      where: { id: In(docenteIds) },
      relations: ['roles'],
    });

    if (docentes.length !== docenteIds.length) {
      throw new NotFoundException('Uno o varios docentes no existen');
    }

    const docenteNoValido = docentes.find(
      (docente) =>
        !docente.roles?.some((role) => role.name?.toUpperCase() === 'DOCENTE'),
    );

    if (docenteNoValido) {
      throw new BadRequestException(
        'Solo se pueden asignar materias a usuarios con rol DOCENTE',
      );
    }

    return docentes;
  }

  private async syncMateriaDocentes(
    materiaId: number,
    docentes: User[],
  ): Promise<void> {
    await this.materiaRepository.manager.query(
      `DELETE FROM "docente_materia" WHERE "materiasIdMateria" = $1`,
      [materiaId],
    );

    if (docentes.length === 0) {
      return;
    }

    await this.materiaRepository.manager
      .createQueryBuilder()
      .relation(User, 'materias')
      .of(docentes.map((docente) => docente.id))
      .add(materiaId);
  }
}
