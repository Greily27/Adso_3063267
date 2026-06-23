import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asignacion } from 'src/asignaciones/entities/asignacione.entity';
import { HorariosController } from './controllers/horarios.controller';
import { Horario } from './entities/horario.entity';
import { HorariosService } from './services/horarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Horario, Asignacion])],
  controllers: [HorariosController],
  providers: [HorariosService],
  exports: [HorariosService],
})
export class HorariosModule {}
