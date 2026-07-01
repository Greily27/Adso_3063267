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
import { PeriodoModule } from './periodo/periodo.module';
import { BoletinesModule } from './boletines/boletines.module';
import { HorariosModule } from './horarios/horarios.module';
import { AuditoriosModule } from './auditorios/auditorios.module';
import { GuiasModule } from './guias/guias.module';
import { EventosModule } from './eventos/eventos.module';
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
        MAIL_HOST: Joi.string().optional(),
        MAIL_PORT: Joi.number().optional(),
        MAIL_SECURE: Joi.boolean().optional(),
        MAIL_USER: Joi.string().optional(),
        MAIL_PASSWORD: Joi.string().optional(),
        MAIL_FROM: Joi.string().optional(),
        BREVO_API_KEY: Joi.string().optional(),
        RESET_PASSWORD_BASE_URL: Joi.string().uri().optional(),
        CORS_ORIGINS: Joi.string().optional(),
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
    AuditoriosModule,
    HorariosModule,
    PeriodoModule,
    BoletinesModule,
    GuiasModule,
    EventosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
