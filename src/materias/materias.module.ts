import { Module } from '@nestjs/common';
import { MateriasService } from '../materias/services/materias.service';
import { MateriasController } from './controllers/materias.controller';

@Module({
  controllers: [MateriasController],
  providers: [MateriasService],
})
export class MateriasModule {}
