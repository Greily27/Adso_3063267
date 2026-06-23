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
import { CreateAsignacioneDto } from '../dtos/create-asignacione.dto';
import { UpdateAsignacioneDto } from '../dtos/update-asignacione.dto';
import { AsignacionesService } from '../services/asignaciones.service';

@ApiTags('Asignaciones')
@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear asignacion' })
  @ApiResponse({ status: 201, description: 'Asignacion creada correctamente' })
  create(@Body() createAsignacioneDto: CreateAsignacioneDto) {
    return this.asignacionesService.create(createAsignacioneDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar asignaciones' })
  findAll() {
    return this.asignacionesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignacion por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar asignacion' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAsignacioneDto: UpdateAsignacioneDto,
  ) {
    return this.asignacionesService.update(id, updateAsignacioneDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar asignacion' })
  @ApiResponse({ status: 200, description: 'Asignacion eliminada correctamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionesService.remove(id);
  }
}
