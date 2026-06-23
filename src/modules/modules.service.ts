import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateModuleDto, UpdateModuleDto } from './dtos/create-module.dto';
import { ModuleEntity } from './entities/module.entity';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(ModuleEntity)
    private moduleRepository: Repository<ModuleEntity>,
  ) {}

  async findByIds(ids: number[]) {
    return this.moduleRepository.findBy({ id: In(ids) });
  }

  async create(dto: CreateModuleDto) {
    const existing = await this.moduleRepository.findOne({
      where: { name: dto.name },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un modulo con ese nombre');
    }

    const module = this.moduleRepository.create(dto);
    return this.moduleRepository.save(module);
  }

  findAll() {
    return this.moduleRepository.find();
  }

  async findOne(id: number) {
    const module = await this.moduleRepository.findOne({
      where: { id },
    });

    if (!module) {
      throw new NotFoundException(`No se encontro el modulo con id ${id}`);
    }

    return module;
  }

  async update(id: number, dto: UpdateModuleDto) {
    const module = await this.findOne(id);

    if (dto.name && dto.name !== module.name) {
      const existing = await this.moduleRepository.findOne({
        where: { name: dto.name },
      });

      if (existing) {
        throw new BadRequestException('Ya existe otro modulo con ese nombre');
      }
    }

    Object.assign(module, dto);

    return this.moduleRepository.save(module);
  }
}
