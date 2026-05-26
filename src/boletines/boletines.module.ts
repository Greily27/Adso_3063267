import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Estudiante } from '../estudiantes/entities/estudiante.entity';
import { Nota } from '../notas/entities/nota.entity';
import { BoletinesController } from './controllers/boletines.controller';
import { Boletin } from './entities/boletin.entity';
import { BoletinesService } from './services/boletines.service';

@Module({
  imports: [TypeOrmModule.forFeature([Boletin, Estudiante, Nota])],
  controllers: [BoletinesController],
  providers: [BoletinesService],
  exports: [BoletinesService],
})
export class BoletinesModule {}
