import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateCursoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nombreCurso: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty()
  readonly isActive: boolean;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({
    description: 'ID del usuario que tiene el rol director de curso',
  })
  directorCurso: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'IDs de los usuarios con rol docente asignados al curso',
    type: [Number],
  })
  docentesIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  @Type(() => Number)
  @ApiPropertyOptional({
    description: 'IDs de las materias asociadas al curso',
    type: [Number],
  })
  materiasIds?: number[];
}

export class UpdateCursoDto extends PartialType(CreateCursoDto) {}
