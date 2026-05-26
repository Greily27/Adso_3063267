import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CreatePeriodoDto } from '../dto/create-periodo.dto';
import { UpdatePeriodoDto } from '../dto/update-periodo.dto';
import { PeriodoService } from '../services/periodo.service';

@ApiTags('Periodo')
@Controller('periodo')
export class PeriodoController {
  constructor(private readonly periodoService: PeriodoService) {}

  @Post()
  @ApiOperation({ summary: 'Crear periodo' })
  @ApiResponse({ status: 201, description: 'Periodo creado correctamente' })
  create(@Body() createPeriodoDto: CreatePeriodoDto) {
    return this.periodoService.create(createPeriodoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar periodos' })
  findAll() {
    return this.periodoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un periodo por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.periodoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar periodo' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePeriodoDto: UpdatePeriodoDto,
  ) {
    return this.periodoService.update(id, updatePeriodoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar periodo' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.periodoService.remove(id);
  }
}
