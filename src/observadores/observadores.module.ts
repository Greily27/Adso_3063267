import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObservadoresController } from './controllers/observadores.controller';
import { Observador } from './entities/observador.entity';
import { ObservadoresService } from './services/observadores.service';
import { User } from 'src/users/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Observador, User]), AuthModule],
  controllers: [ObservadoresController],
  providers: [ObservadoresService],
  exports: [ObservadoresService],
})
export class ObservadoresModule {}
