import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMateriaDto {
  @IsString()
  @ApiProperty({
    example: 'Matematicas',
    description: 'Nombre de la materia',
  })
  nombreMateria: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({
    example: true,
    description: 'Estado de la materia',
    default: true,
  })
  estado?: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @ApiPropertyOptional({
    example: [1, 2],
    description: 'IDs de los cursos asociados a la materia',
    type: [Number],
  })
  cursosIds?: number[];

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    example: 1,
    description: 'ID del usuario docente asignado a la materia',
  })
  docenteId?: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    example: [1, 2],
    description: 'IDs de los usuarios docentes asignados a la materia',
    type: [Number],
  })
  docenteIds?: number[];
}

export class UpdateMateriaDto extends PartialType(CreateMateriaDto) {}
