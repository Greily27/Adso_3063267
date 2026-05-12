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

import {
  CreateObservadorDto,
  UpdateObservadorDto,
} from '../dto/observador.dto';
import { ObservadoresService } from '../services/observadores.service';

@ApiTags('Observadores')
@Controller('observadores')
export class ObservadoresController {
  constructor(private readonly observadoresService: ObservadoresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear observador' })
  @ApiResponse({ status: 201, description: 'Observador creado correctamente' })
  create(@Body() createObservadorDto: CreateObservadorDto) {
    return this.observadoresService.create(createObservadorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar observadores' })
  findAll() {
    return this.observadoresService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un observador por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.observadoresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar observador' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateObservadorDto: UpdateObservadorDto,
  ) {
    return this.observadoresService.update(id, updateObservadorDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar observador' })
  @ApiResponse({
    status: 200,
    description: 'Observador eliminado correctamente',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.observadoresService.remove(id);
  }
}
