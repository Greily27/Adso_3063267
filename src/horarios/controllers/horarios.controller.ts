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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { CreateHorarioDto } from '../dto/create-horario.dto';
import { UpdateHorarioDto } from '../dto/update-horario.dto';
import { HorariosService } from '../services/horarios.service';

@ApiTags('Horarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear horario' })
  @ApiResponse({ status: 201, description: 'Horario creado correctamente' })
  create(@Body() createHorarioDto: CreateHorarioDto, @Req() req) {
    return this.horariosService.create(createHorarioDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar horarios' })
  findAll(@Req() req) {
    return this.horariosService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un horario por ID' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.horariosService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar horario' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHorarioDto: UpdateHorarioDto,
    @Req() req,
  ) {
    return this.horariosService.update(id, updateHorarioDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar horario' })
  @ApiResponse({ status: 200, description: 'Horario eliminado correctamente' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.horariosService.remove(id, req.user.id);
  }
}
