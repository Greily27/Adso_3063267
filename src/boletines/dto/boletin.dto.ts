import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { EstadoBoletin } from '../entities/boletin.entity';

export class GenerarBoletinesDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 1,
    description: 'ID del curso para el que se generan boletines',
  })
  cursoId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({
    example: 1,
    description: 'ID del periodo para el que se generan boletines',
  })
  periodoId: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({
    example: 'https://example.com/boletines/curso-1-periodo-1.pdf',
    description: 'URL base o archivo generado para los boletines',
  })
  archivoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @ApiPropertyOptional({
    example: 'uploads/boletines/curso-1-periodo-1.pdf',
    description: 'Ruta local base o archivo generado para los boletines',
  })
  rutaArchivo?: string;
}

export class PublicarBoletinItemDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 1 })
  estudianteId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 2 })
  periodoId: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ example: 3 })
  cursoId: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: 4.2 })
  promedio?: number;

  @IsEnum(EstadoBoletin)
  @ApiProperty({
    enum: EstadoBoletin,
    example: EstadoBoletin.PUBLICADO,
  })
  estado: EstadoBoletin;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({ example: 'boletin-juan-periodo-1.html' })
  nombreArchivo: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: '<!doctype html><html></html>' })
  html: string;

  @IsObject()
  @IsOptional()
  @ApiPropertyOptional({
    example: {
      estudiante: 'Juan Perez',
      documento: '123',
      curso: '601',
      periodo: 'Periodo 1',
      promedioLabel: '4.2',
      resultado: 'Aprobado',
    },
  })
  metadata?: Record<string, any>;
}

export class PublicarBoletinesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PublicarBoletinItemDto)
  @ApiProperty({ type: [PublicarBoletinItemDto] })
  boletines: PublicarBoletinItemDto[];
}
