import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import {
  CreateObservadorDto,
  UpdateObservadorDto,
} from '../dto/observador.dto';
import { ObservadoresService } from '../services/observadores.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Observadores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('observadores')
export class ObservadoresController {
  constructor(private readonly observadoresService: ObservadoresService) {}

  @Post()
  @ApiOperation({ summary: 'Crear observador' })
  @ApiResponse({ status: 201, description: 'Observador creado correctamente' })
  create(@Body() createObservadorDto: CreateObservadorDto, @Req() req) {
    return this.observadoresService.create(createObservadorDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar observadores' })
  findAll(@Req() req) {
    return this.observadoresService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un observador por ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.observadoresService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar observador' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateObservadorDto: UpdateObservadorDto,
    @Req() req,
  ) {
    return this.observadoresService.update(
      id,
      updateObservadorDto,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar observador' })
  @ApiResponse({
    status: 200,
    description: 'Observador eliminado correctamente',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.observadoresService.remove(id, req.user.id);
  }
}
