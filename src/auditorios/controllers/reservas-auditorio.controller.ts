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
  CreateReservaAuditorioDto,
  UpdateReservaAuditorioDto,
} from '../dto/reserva-auditorio.dto';
import { ReservasAuditorioService } from '../services/reservas-auditorio.service';

@ApiTags('Reservas Auditorio')
@Controller('reservas-auditorio')
export class ReservasAuditorioController {
  constructor(
    private readonly reservasAuditorioService: ReservasAuditorioService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear reserva de auditorio' })
  @ApiResponse({ status: 201, description: 'Reserva creada correctamente' })
  create(@Body() createReservaDto: CreateReservaAuditorioDto) {
    return this.reservasAuditorioService.create(createReservaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar reservas de auditorio' })
  findAll() {
    return this.reservasAuditorioService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reserva de auditorio por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservasAuditorioService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar reserva de auditorio' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservaDto: UpdateReservaAuditorioDto,
  ) {
    return this.reservasAuditorioService.update(id, updateReservaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar reserva de auditorio' })
  @ApiResponse({ status: 200, description: 'Reserva eliminada correctamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservasAuditorioService.remove(id);
  }
}
