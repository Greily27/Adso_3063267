import { IsString, IsNotEmpty, IsEmail, IsInt } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
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
}

export class UpdateEstudianteDto extends PartialType(CreateEstudianteDto) {}
