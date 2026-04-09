import { IsString, IsNotEmpty, IsOptional, IsInt, IsBoolean } from 'class-validator';
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

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @ApiPropertyOptional({ description: 'ID del director de curso' })
  directorCurso?: number;
}

export class UpdateCursoDto extends PartialType(CreateCursoDto) { }