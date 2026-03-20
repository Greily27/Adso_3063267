import {Controller,Get,Post,Body,Patch,Param,ParseIntPipe,} from '@nestjs/common';
import { CursosService } from '../services/cursos.service';
import { CreateCursoDto, UpdateCursoDto } from '../dtos/create-curso.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Cursos')
@Controller('cursos')
export class CursosController {
  constructor(private readonly cursosService: CursosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear curso' })
  create(@Body() dto: CreateCursoDto) {
    return this.cursosService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cursos' })
  findAll() {
    return this.cursosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener curso' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar curso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCursoDto,
  ) {
    return this.cursosService.update(id, dto);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Desactivar curso' })
  deactivate(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.deactivate(id);
  }

  @Get(':id/estudiantes')
  @ApiOperation({ summary: 'Obtener estudiantes de un curso' })
  getEstudiantes(@Param('id', ParseIntPipe) id: number) {
    return this.cursosService.getEstudiantes(id);
  }
}