import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { DestinatarioEvento, EstadoEvento } from '../entities/evento.entity';

const toArray = ({ value }: { value: unknown }): unknown => {
  if (Array.isArray(value)) return value as unknown[];
  if (typeof value !== 'string') return value;
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? (parsed as unknown[]) : [parsed];
  } catch {
    return value.split(',').map((item) => item.trim());
  }
};

export class CreateEventoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  @ApiProperty({ example: 'Entrega de boletines' })
  titulo: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ example: 'ACADÉMICO' })
  categoria: string;

  @IsDateString()
  @ApiProperty({ example: '2026-07-15T08:00:00-05:00' })
  fechaInicio: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @ApiPropertyOptional({ example: 'Auditorio principal' })
  ubicacion?: string;

  @Transform(toArray)
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(DestinatarioEvento, { each: true })
  @ApiProperty({ enum: DestinatarioEvento, isArray: true })
  destinatarios: DestinatarioEvento[];

  @IsOptional()
  @IsEnum(EstadoEvento)
  @ApiPropertyOptional({ enum: EstadoEvento })
  estado?: EstadoEvento;
}

export class UpdateEventoDto extends PartialType(CreateEventoDto) {}
