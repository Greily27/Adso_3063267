import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MateriasService } from '../materias/services/materias.service';
import { MateriasController } from './controllers/materias.controller';
import { Materia } from './entities/materia.entity';
import { Curso } from '../cursos/entities/curso.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Materia, Curso, User])],
  controllers: [MateriasController],
  providers: [MateriasService],
  exports: [MateriasService],
})
export class MateriasModule {}
