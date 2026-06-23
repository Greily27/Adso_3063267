import {Controller,Get,Post,Body,Patch,Param,ParseIntPipe,} from '@nestjs/common';
import { EstudiantesService } from '../services/estudiantes.service';
import {
  CreateEstudianteDto,
  UpdateEstudianteDto,
} from '../dto/estudiante.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Estudiantes')
@Controller('estudiantes')
export class EstudiantesController {
  constructor(
    private readonly estudiantesService: EstudiantesService,
  ) {}

  //CREAR ESTUDIANTE
  @Post()
  @ApiOperation({ summary: 'Crear un estudiante' })
  @ApiResponse({ status: 201, description: 'Estudiante creado correctamente' })
  create(@Body() dto: CreateEstudianteDto) {
    return this.estudiantesService.create(dto);
  }

  //LISTAR TODOS
  @Get()
  @ApiOperation({ summary: 'Listar todos los estudiantes' })
  findAll() {
    return this.estudiantesService.findAll();
  }

  //OBTENER UNO
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estudiante por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.estudiantesService.findOne(id);
  }

  //ACTUALIZAR
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar estudiante' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstudianteDto,
  ) {
    return this.estudiantesService.update(id, dto);
  }
}