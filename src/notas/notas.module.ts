import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotasService } from './services/notas.service';
import { NotasController } from './controllers/notas.controller';
import { Nota } from './entities/nota.entity';
import { Materia } from '../materias/entities/materia.entity';
import { Asignacion } from '../asignaciones/entities/asignacione.entity';
import { Periodo } from '../periodo/entities/periodo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Nota, Materia, Asignacion, Periodo])],
  controllers: [NotasController],
  providers: [NotasService],
  exports: [NotasService],
})
export class NotasModule {}
