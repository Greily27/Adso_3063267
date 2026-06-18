import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { AuditoriosController } from './controllers/auditorios.controller';
import { ReservasAuditorioController } from './controllers/reservas-auditorio.controller';
import { Auditorio } from './entities/auditorio.entity';
import { ReservaAuditorio } from './entities/reserva-auditorio.entity';
import { AuditoriosService } from './services/auditorios.service';
import { ReservasAuditorioService } from './services/reservas-auditorio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auditorio, ReservaAuditorio, User])],
  controllers: [AuditoriosController, ReservasAuditorioController],
  providers: [AuditoriosService, ReservasAuditorioService],
  exports: [AuditoriosService, ReservasAuditorioService],
})
export class AuditoriosModule {}
