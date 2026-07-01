import {
  IsArray,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateEstudianteDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly tipoDocTutor: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly documentoTutor: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  readonly emailTutor: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly nombreTutor: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly apellidoTutor: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly ocupacionTutor: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly telefonoTutor: string;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({ description: 'ID del usuario' })
  readonly userId: number;

  @IsInt()
  @Type(() => Number)
  @ApiProperty({ description: 'ID del curso' })
  readonly cursoId: number;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Type(() => Number)
  @ApiPropertyOptional({
    type: [Number],
    description: 'IDs de usuarios con rol ACUDIENTE asociados',
  })
  readonly acudienteUserIds?: number[];
}

export class UpdateEstudianteDto extends PartialType(CreateEstudianteDto) {}
