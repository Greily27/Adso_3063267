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
import { MateriasService } from '../services/materias.service';
import { CreateMateriaDto, UpdateMateriaDto } from '../dto/materia.dto';

@ApiTags('Materias')
@Controller('materias')
export class MateriasController {
  constructor(private readonly materiasService: MateriasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear materia' })
  @ApiResponse({ status: 201, description: 'Materia creada correctamente' })
  create(@Body() createMateriaDto: CreateMateriaDto) {
    return this.materiasService.create(createMateriaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar materias' })
  findAll() {
    return this.materiasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una materia por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.materiasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar materia y su estado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMateriaDto: UpdateMateriaDto,
  ) {
    return this.materiasService.update(id, updateMateriaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar materia' })
  @ApiResponse({ status: 200, description: 'Materia eliminada correctamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.materiasService.remove(id);
  }
}
