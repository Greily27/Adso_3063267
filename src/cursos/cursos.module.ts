import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiante.entity';
import { CursosService } from './services/cursos.service';
import { CursosController } from './controllers/cursos.controller';
import { User } from 'src/users/entities/user.entity';
import { Materia } from 'src/materias/entities/materia.entity';
import { AsignacionesModule } from 'src/asignaciones/asignaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Curso, Materia, User, Estudiante]),
    AsignacionesModule,
  ],
  controllers: [CursosController],
  providers: [CursosService],
})
export class CursosModule {}
