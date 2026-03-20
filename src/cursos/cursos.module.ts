import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from './entities/curso.entity';
import { Estudiante } from 'src/estudiantes/entities/estudiante.entity';
import { CursosService } from './services/cursos.service';
import { CursosController } from './controllers/cursos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, Estudiante])],
  controllers: [CursosController],
  providers: [CursosService],
})
export class CursosModule {}