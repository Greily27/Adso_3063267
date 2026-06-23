import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Curso } from 'src/cursos/entities/curso.entity';
import { AsignacionesController } from './controllers/asignaciones.controller';
import { Asignacion } from './entities/asignacione.entity';
import { AsignacionesService } from './services/asignaciones.service';

@Module({
  imports: [TypeOrmModule.forFeature([Asignacion, Curso])],
  controllers: [AsignacionesController],
  providers: [AsignacionesService],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}
