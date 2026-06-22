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
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

import { CreateGuiaDto } from '../dto/create-guia.dto';
import { UpdateGuiaDto } from '../dto/update-guia.dto';
import { GuiasService } from '../services/guias.service';

const guiaFileInterceptor = FileInterceptor('archivo', {
  storage: diskStorage({
    destination: (_req, _file, cb) => {
      const uploadDir = join(process.cwd(), 'uploads', 'guias');
      mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
      const safeName = file.originalname
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z0-9._-]/g, '');
      const extension = extname(safeName);
      const nameWithoutExtension = extension
        ? safeName.slice(0, -extension.length)
        : safeName;
      const uniqueName = `${Date.now()}-${nameWithoutExtension || 'guia'}${extension.toLowerCase()}`;

      cb(null, uniqueName);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const extension = extname(file.originalname).toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const validMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (
      !validExtensions.includes(extension) ||
      !validMimeTypes.includes(file.mimetype)
    ) {
      return cb(
        new BadRequestException('Solo se permiten archivos PDF, DOC o DOCX'),
        false,
      );
    }

    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

@ApiTags('Guias')
@Controller('guias')
export class GuiasController {
  constructor(private readonly guiasService: GuiasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar guias' })
  findAll() {
    return this.guiasService.findAll();
  }

  @Post()
  @UseInterceptors(guiaFileInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Crear guia' })
  @ApiResponse({ status: 201, description: 'Guia creada correctamente' })
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'nombreGuia',
        'descripcion',
        'estado',
        'asignacionId',
        'archivo',
      ],
      properties: {
        nombreGuia: { type: 'string' },
        descripcion: { type: 'string' },
        estado: { type: 'boolean' },
        asignacionId: { type: 'number' },
        archivo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  create(
    @Body() createGuiaDto: CreateGuiaDto,
    @UploadedFile() file: any,
    @Req() req,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Debe enviar un archivo en el campo archivo',
      );
    }

    return this.guiasService.create(
      createGuiaDto,
      this.buildArchivoUrl(req, file.filename),
    );
  }

  @Patch(':id')
  @UseInterceptors(guiaFileInterceptor)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Actualizar guia' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        nombreGuia: { type: 'string' },
        descripcion: { type: 'string' },
        estado: { type: 'boolean' },
        asignacionId: { type: 'number' },
        archivo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGuiaDto: UpdateGuiaDto,
    @UploadedFile() file: any,
    @Req() req,
  ) {
    return this.guiasService.update(
      id,
      updateGuiaDto,
      file ? this.buildArchivoUrl(req, file.filename) : undefined,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar guia' })
  @ApiResponse({ status: 200, description: 'Guia desactivada correctamente' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.guiasService.remove(id);
  }

  private buildArchivoUrl(req, filename: string): string {
    return `${req.protocol}://${req.get('host')}/uploads/guias/${encodeURIComponent(filename)}`;
  }
}
