import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateCursoDto {

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  nombreCurso: string;
}

export class UpdateCursoDto extends PartialType(CreateCursoDto) {}