import {BadRequestException,Injectable,NotFoundException,} from '@nestjs/common';
import { Curso } from 'src/cursos/entities/curso.entity';
import {CreateEstudianteDto,UpdateEstudianteDto,} from '../dto/estudiante.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Estudiante } from '../entities/estudiante.entity';

@Injectable()
export class EstudiantesService {
  constructor(
    @InjectRepository(Estudiante)
    private readonly estudianteRepository: Repository<Estudiante>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  //CREAR
  async create(dto: CreateEstudianteDto) {
    const { userId, cursoId, ...data } = dto;
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['estudiante'],
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    if (user.estudiante) {
      throw new BadRequestException('El usuario ya es estudiante');
    }
    const curso = await this.cursoRepository.findOne({
      where: { id: cursoId },
    });
    if (!curso) {
      throw new NotFoundException('Curso no encontrado');
    }
    const estudiante = this.estudianteRepository.create({
      ...data,
      user,
      curso,
    });
    return await this.estudianteRepository.save(estudiante);
  }

  //LISTAR
  async findAll() {
    return await this.estudianteRepository.find({
      relations: ['user', 'curso'],
    });
  }

  //OBTENER UNO
  async findOne(id: number) {
    const estudiante = await this.estudianteRepository.findOne({
      where: { id },
      relations: ['user', 'curso'],
    });
    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }
    return estudiante;
  }

  //ACTUALIZAR
  async update(id: number, dto: UpdateEstudianteDto) {
    const estudiante = await this.findOne(id);
    //actualizar curso si viene
    if (dto.cursoId) {
      const curso = await this.cursoRepository.findOne({
        where: { id: dto.cursoId },
      });
      if (!curso) {
        throw new NotFoundException('Curso no encontrado');
      }
      estudiante.curso = curso;
    }

    //actualizar datos
    Object.assign(estudiante, dto);

    return await this.estudianteRepository.save(estudiante);
  }

}