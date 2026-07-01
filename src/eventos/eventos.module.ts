import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/users/entities/user.entity';
import { EventosController } from './controllers/eventos.controller';
import { Evento } from './entities/evento.entity';
import { EventosService } from './services/eventos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, User]), AuthModule],
  controllers: [EventosController],
  providers: [EventosService],
})
export class EventosModule {}
