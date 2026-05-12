import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ObservadoresController } from './controllers/observadores.controller';
import { Observador } from './entities/observador.entity';
import { ObservadoresService } from './services/observadores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Observador])],
  controllers: [ObservadoresController],
  providers: [ObservadoresService],
  exports: [ObservadoresService],
})
export class ObservadoresModule {}
