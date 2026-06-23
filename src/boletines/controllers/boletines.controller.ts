import {
  Body,
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { extname, resolve } from 'path';

import { JwtAuthGuard } from '../../auth/guards/auth.guard';
import {
  GenerarBoletinesDto,
  PublicarBoletinesDto,
} from '../dto/boletin.dto';
import { BoletinesService } from '../services/boletines.service';

@ApiTags('Boletines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('boletines')
export class BoletinesController {
  constructor(private readonly boletinesService: BoletinesService) {}

  @Get('me')
  @ApiOperation({ summary: 'Listar boletines publicados del estudiante' })
  findMine(@Req() req) {
    return this.boletinesService.findMine(req.user);
  }

  @Get('me/:id/download')
  @Header('Content-Type', 'application/octet-stream')
  @ApiOperation({ summary: 'Descargar boletin propio publicado' })
  async downloadMine(
    @Req() req,
    @Res() res: Response,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const boletin = await this.boletinesService.findMineForDownload(
      req.user,
      id,
    );
    const archivo = boletin.rutaArchivo ?? boletin.archivoUrl;

    if (!archivo) {
      throw new NotFoundException('El boletin no tiene archivo asociado');
    }

    if (/^https?:\/\//i.test(archivo)) {
      return res.redirect(archivo);
    }

    const filePath = resolve(archivo);

    if (!existsSync(filePath)) {
      throw new NotFoundException('No se encontro el archivo del boletin');
    }

    const extension = extname(filePath).toLowerCase();
    const contentType = extension === '.html' ? 'text/html' : 'application/pdf';

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="boletin-${boletin.id}${extension || '.pdf'}"`,
    });

    return createReadStream(filePath).pipe(res);
  }

  @Get('me/:periodoId')
  @ApiOperation({ summary: 'Obtener boletin propio publicado por periodo' })
  findMineByPeriodo(
    @Req() req,
    @Param('periodoId', ParseIntPipe) periodoId: number,
  ) {
    return this.boletinesService.findMineByPeriodo(req.user, periodoId);
  }

  @Post('generar')
  @ApiOperation({
    summary: 'Generar boletines en borrador por curso y periodo',
  })
  generar(@Req() req, @Body() generarBoletinesDto: GenerarBoletinesDto) {
    return this.boletinesService.generar(req.user, generarBoletinesDto);
  }

  @Post('publicar')
  @ApiOperation({
    summary: 'Publicar boletines generados desde HTML',
  })
  publicarLote(@Req() req, @Body() publicarBoletinesDto: PublicarBoletinesDto) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    return this.boletinesService.publicarLote(
      req.user,
      publicarBoletinesDto,
      baseUrl,
    );
  }

  @Patch(':id/publicar')
  @ApiOperation({ summary: 'Publicar boletin para el estudiante' })
  publicar(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.boletinesService.publicar(req.user, id);
  }
}
