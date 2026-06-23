import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CursosService } from '../services/cursos.service';
import { CreateCursoDto, UpdateCursoDto } from '../dtos/create-curso.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Cursos')
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) { }

  // ===== CREAR =====
  @Post()
  @ApiOperation({ summary: 'Crear curso' })
  @ApiResponse({ status: 201, description: 'Curso creado correctamente' })
  create(@Body() dto: CreateCursoDto) {
    return this.cursosService.create(dto);
  }

  // ===== LISTAR =====
  @Get()
  @ApiOperation({ summary: 'Listar cursos activos' })
  findAll() {
    return this.cursosService.findAll();
  }

  // ===== OBTENER UNO =====
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un curso por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findOne(id);
  }

  // ===== ACTUALIZAR =====
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar curso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCursoDto,
  ) {
    return this.cursosService.update(id, dto);
  }

  // ===== DESACTIVAR =====
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar curso' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.deactivate(id);
  }

  // ===== OBTENER ESTUDIANTES =====
  @Get(':id/estudiantes')
  @ApiOperation({ summary: 'Obtener estudiantes de un curso' })
  getEstudiantes(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.getEstudiantes(id);
  }
}