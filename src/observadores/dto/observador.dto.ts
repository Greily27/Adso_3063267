import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateObservadorDto {
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID del estudiante asociado al observador',
  })
  estudianteId: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID del curso asociado al observador',
  })
  cursoId: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID del usuario con rol de docente',
  })
  docenteId: number;

  @IsDateString()
  @ApiProperty({
    example: '2026-05-11',
    description: 'Fecha del registro del observador',
  })
  fecha: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({
    example: 'Convivencia',
    description: 'Categoria del registro del observador',
  })
  categoria: string;

  @IsString()
  @ApiProperty({
    example: 'El estudiante presento una mejora en su comportamiento.',
    description: 'Descripcion del registro del observador',
  })
  descripcion: string;
}

export class UpdateObservadorDto extends PartialType(CreateObservadorDto) {}
