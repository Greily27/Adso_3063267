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
import { CreateAuditorioDto, UpdateAuditorioDto } from '../dto/auditorio.dto';
import { AuditoriosService } from '../services/auditorios.service';

@ApiTags('Auditorios')
@Controller('auditorios')
export class AuditoriosController {
  constructor(private readonly auditoriosService: AuditoriosService) {}

  @Post()
  @ApiOperation({ summary: 'Crear auditorio' })
  @ApiResponse({ status: 201, description: 'Auditorio creado correctamente' })
  create(@Body() createAuditorioDto: CreateAuditorioDto) {
    return this.auditoriosService.create(createAuditorioDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar auditorios' })
  findAll() {
    return this.auditoriosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un auditorio por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar auditorio' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuditorioDto: UpdateAuditorioDto,
  ) {
    return this.auditoriosService.update(id, updateAuditorioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar auditorio' })
  @ApiResponse({
    status: 200,
    description: 'Auditorio eliminado correctamente',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.auditoriosService.remove(id);
  }
}
