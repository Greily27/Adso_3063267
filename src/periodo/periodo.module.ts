import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PeriodoController } from './controllers/periodo.controller';
import { Periodo } from './entities/periodo.entity';
import { PeriodoService } from './services/periodo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Periodo])],
  controllers: [PeriodoController],
  providers: [PeriodoService],
  exports: [PeriodoService],
})
export class PeriodoModule {}
