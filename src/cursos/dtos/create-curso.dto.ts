import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CursoAsignacionDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    example: 1,
    description: 'ID de la materia de la asignacion',
  })
  materiaId: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    example: 1,
    description: 'ID del docente de la asignacion',
  })
  docenteId: number;
}

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
  @IsOptional()
  @Type(() => Number)
  @ApiProperty({
    description: 'ID del usuario registrado como director del curso',
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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @IsObject({ each: true })
  @Type(() => CursoAsignacionDto)
  @ApiPropertyOptional({
    description: 'Asignaciones de materia y docente que se crean con el curso',
    type: [CursoAsignacionDto],
  })
  asignaciones?: CursoAsignacionDto[];
}

export class UpdateCursoDto extends PartialType(CreateCursoDto) {}
