import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { getUploadPath } from 'src/common/uploads';
import { CreateEventoDto, UpdateEventoDto } from '../dto/evento.dto';
import { EventosService } from '../services/eventos.service';

const imagenInterceptor = FileInterceptor('imagen', {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const directory = getUploadPath('eventos');
      mkdirSync(directory, { recursive: true });
      cb(null, directory);
    },
    filename: (_req, file, cb) => {
      cb(
        null,
        `${Date.now()}-${randomUUID()}${extname(file.originalname).toLowerCase()}`,
      );
    },
  }),
  fileFilter: (_req, file, cb) => {
    const extension = extname(file.originalname).toLowerCase();
    const valid = ['.jpg', '.jpeg', '.png', '.webp'];
    if (!valid.includes(extension) || !file.mimetype.startsWith('image/')) {
      return cb(
        new BadRequestException('La imagen debe ser JPG, PNG o WEBP'),
        false,
      );
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

@ApiTags('Eventos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('eventos')
export class EventosController {
  constructor(private readonly eventosService: EventosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar eventos disponibles para el usuario' })
  findAll(@Req() req) {
    return this.eventosService.findAll(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un evento disponible para el usuario' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.eventosService.findOne(id, req.user.id);
  }

  @Post()
  @UseInterceptors(imagenInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateEventoDto })
  @ApiOperation({ summary: 'Crear evento (administración)' })
  create(
    @Body() dto: CreateEventoDto,
    @UploadedFile() imagen: any,
    @Req() req,
  ) {
    return this.eventosService.create(
      dto,
      imagen ? this.imageUrl(req, imagen.filename) : undefined,
      req.user.id,
    );
  }

  @Patch(':id')
  @UseInterceptors(imagenInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateEventoDto })
  @ApiOperation({ summary: 'Actualizar evento (administración)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventoDto,
    @UploadedFile() imagen: any,
    @Req() req,
  ) {
    return this.eventosService.update(
      id,
      dto,
      imagen ? this.imageUrl(req, imagen.filename) : undefined,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancelar evento (administración)' })
  cancel(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.eventosService.cancel(id, req.user.id);
  }

  private imageUrl(req, filename: string) {
    return `${req.protocol}://${req.get('host')}/uploads/eventos/${encodeURIComponent(filename)}`;
  }
}
