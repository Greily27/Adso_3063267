import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';

import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { enviroments } from './enviroments';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { AuthModule } from './auth/auth.module';
import { ModulesModule } from './modules/modules.module';
import { CursosModule } from './cursos/cursos.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { MateriasModule } from './materias/materias.module';
import { NotasModule } from './notas/notas.module';
import { ObservadoresModule } from './observadores/observadores.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';
import config from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: enviroments[process.env.NODE_ENV || '.env'],
      load: [config],
      isGlobal: true,
      validationSchema: Joi.object({
        POSTGRES_DB: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_HOST: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.number().required(),
      }),
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    ModulesModule,
    CursosModule,
    EstudiantesModule,
    MateriasModule,
    NotasModule,
    ObservadoresModule,
    AsignacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
