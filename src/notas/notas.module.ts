import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotasService } from './services/notas.service';
import { NotasController } from './controllers/notas.controller';
import { Nota } from './entities/nota.entity';
import { Materia } from '../materias/entities/materia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nota, Materia])],
  controllers: [NotasController],
  providers: [NotasService],
  exports: [NotasService],
})
export class NotasModule {}
