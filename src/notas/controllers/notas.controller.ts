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
import { NotasService } from '../services/notas.service';
import { CreateNotaDto, UpdateNotaDto } from '../dto/nota.dto';

@ApiTags('Notas')
@Controller('notas')
export class NotasController {
  constructor(private readonly notasService: NotasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nota' })
  @ApiResponse({ status: 201, description: 'Nota creada correctamente' })
  create(@Body() createNotaDto: CreateNotaDto) {
    return this.notasService.create(createNotaDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar notas' })
  findAll() {
    return this.notasService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una nota por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.notasService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar nota' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateNotaDto: UpdateNotaDto,
  ) {
    return this.notasService.update(id, updateNotaDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar nota' })
  @ApiResponse({ status: 200, description: 'Nota eliminada correctamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.notasService.remove(id);
  }
}
