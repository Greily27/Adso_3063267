import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EstudiantesService } from '../services/estudiantes.service';
import {
  CreateEstudianteDto,
  UpdateEstudianteDto,
} from '../dto/estudiante.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('Estudiantes')
@UseGuards(JwtAuthGuard)
@Controller('estudiantes')
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  //CREAR ESTUDIANTE
  @Post()
  @ApiOperation({ summary: 'Crear un estudiante' })
  @ApiResponse({ status: 201, description: 'Estudiante creado correctamente' })
  create(@Body() dto: CreateEstudianteDto, @Req() req) {
    this.assertPuedeGestionar(req.user);
    return this.estudiantesService.create(dto);
  }

  //LISTAR TODOS
  @Get()
  @ApiOperation({ summary: 'Listar todos los estudiantes' })
  findAll(@Req() req) {
    if (this.esAcudiente(req.user)) {
      return this.estudiantesService.findAcudidos(req.user.id);
    }
    return this.estudiantesService.findAll();
  }

  @Get('mis-acudidos')
  @ApiOperation({ summary: 'Listar estudiantes asociados al acudiente' })
  findAcudidos(@Req() req) {
    return this.estudiantesService.findAcudidos(req.user.id);
  }

  //OBTENER UNO
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estudiante por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    if (this.esAcudiente(req.user)) {
      const acudidos = await this.estudiantesService.findAcudidos(req.user.id);
      const estudiante = acudidos.find((item) => item.id === id);
      if (!estudiante) {
        throw new ForbiddenException(
          'El estudiante no está asociado al acudiente',
        );
      }
      return estudiante;
    }
    return this.estudiantesService.findOne(id);
  }

  //ACTUALIZAR
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar estudiante' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEstudianteDto,
    @Req() req,
  ) {
    this.assertPuedeGestionar(req.user);
    return this.estudiantesService.update(id, dto);
  }

  private esAcudiente(user): boolean {
    return (
      user?.roles?.some(
        (role) => String(role.name).trim().toUpperCase() === 'ACUDIENTE',
      ) ?? false
    );
  }

  private assertPuedeGestionar(user) {
    const roles =
      user?.roles?.map((role) => String(role.name).trim().toUpperCase()) ?? [];
    if (
      !roles.some((role) =>
        [
          'ADMIN',
          'ADMINISTRADOR',
          'AUXILIAR ADMINISTRATIVO',
          'AUXILIAR_ADMINISTRATIVO',
        ].includes(role),
      )
    ) {
      throw new ForbiddenException(
        'Solo administración puede gestionar estudiantes',
      );
    }
  }
}
