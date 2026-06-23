import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Asignacion } from 'src/asignaciones/entities/asignacione.entity';
import { GuiasController } from './controllers/guias.controller';
import { Guia } from './entities/guia.entity';
import { GuiasService } from './services/guias.service';

@Module({
  imports: [TypeOrmModule.forFeature([Guia, Asignacion])],
  controllers: [GuiasController],
  providers: [GuiasService],
})
export class GuiasModule {}
