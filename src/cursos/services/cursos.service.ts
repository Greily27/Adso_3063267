import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Curso } from '../entities/curso.entity';
import { Repository } from 'typeorm';
import { CreateCursoDto, UpdateCursoDto } from '../dtos/create-curso.dto';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) { }

  //======CREAR=========
  async create(dto: CreateCursoDto) {
    const existing = await this.cursoRepository.findOne({
      where: { nombreCurso: dto.nombreCurso },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un curso con ese nombre');
    }

    const curso = this.cursoRepository.create(dto);
    return await this.cursoRepository.save(curso);
  }

  //========LISTAR========
  async findAll() {
    return await this.cursoRepository.find({
      where: { isActive: true },
      relations: ['estudiantes'],
    });
  }

  //=======BUSCAR UNO=======
  async findOne(id: number) {
    const curso = await this.cursoRepository.findOne({
      where: { id, isActive: true },
      relations: ['estudiantes', 'estudiantes.user'],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    return curso;
  }

  //=======ACTUALIZAR============
  async update(id: number, dto: UpdateCursoDto) {
    const curso = await this.findOne(id);

    if (dto.nombreCurso) {
      const existing = await this.cursoRepository.findOne({
        where: { nombreCurso: dto.nombreCurso },
      });

      if (existing && existing.id !== id) {
        throw new BadRequestException('Ya existe un curso con ese nombre');
      }
    }

    Object.assign(curso, dto);
    return await this.cursoRepository.save(curso);
  }

  //======DESACTIVAR=========
  async deactivate(id: number) {
    const curso = await this.cursoRepository.findOne({
      where: { id },
      relations: ['estudiantes'],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    if (curso.estudiantes.length > 0) {
      throw new BadRequestException(
        'No se puede desactivar el curso porque tiene estudiantes',
      );
    }

    curso.isActive = false;

    return await this.cursoRepository.save(curso);
  }

  //======OBTENER ESTUDIANTES===========
  async getEstudiantes(id: number) {
    const curso = await this.cursoRepository.findOne({
      where: { id },
      relations: ['estudiantes', 'estudiantes.user'],
    });

    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }

    const estudiantes = curso.estudiantes.map((est) => ({
      id: est.user.id,
      nombres: est.user.names,
      apellidos: est.user.lastNames,
      promedio: est.promedio,
    }));

    return {
      curso: curso.nombreCurso,
      totalEstudiantes: estudiantes.length,
      estudiantes,
    };
  }
}