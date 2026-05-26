import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateNotaDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  @ApiProperty({
    example: 4.5,
    description: 'Valor de la nota entre 1.0 y 5.0',
  })
  valor: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  @ApiPropertyOptional({
    example: 'Nota del primer parcial',
    description: 'Descripcion de la nota',
  })
  descripcion?: string;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID del estudiante asociado a la nota',
  })
  estudianteId: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID del curso asociado a la nota',
  })
  cursoId: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID de la materia asociada a la nota',
  })
  materiaId: number;

  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: 'ID del periodo asociado a la nota',
  })
  periodoId: number;
}

export class UpdateNotaDto extends PartialType(CreateNotaDto) {}
