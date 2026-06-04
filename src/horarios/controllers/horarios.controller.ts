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
import { CreateHorarioDto } from '../dto/create-horario.dto';
import { UpdateHorarioDto } from '../dto/update-horario.dto';
import { HorariosService } from '../services/horarios.service';

@ApiTags('Horarios')
@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear horario' })
  @ApiResponse({ status: 201, description: 'Horario creado correctamente' })
  create(@Body() createHorarioDto: CreateHorarioDto) {
    return this.horariosService.create(createHorarioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar horarios' })
  findAll() {
    return this.horariosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un horario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.horariosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar horario' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHorarioDto: UpdateHorarioDto,
  ) {
    return this.horariosService.update(id, updateHorarioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar horario' })
  @ApiResponse({ status: 200, description: 'Horario eliminado correctamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.horariosService.remove(id);
  }
}
