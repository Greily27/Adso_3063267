import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Estudiante } from './entities/estudiante.entity';
import { User } from 'src/users/entities/user.entity';
import { EstudiantesService } from './services/estudiantes.service';
import { EstudiantesController } from './controllers/estudiantes.controller';
import { Curso } from 'src/cursos/entities/curso.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Role } from 'src/roles/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Estudiante, User, Curso, Role]),
    AuthModule,
  ],
  controllers: [EstudiantesController],
  providers: [EstudiantesService],
})
export class EstudiantesModule {}
