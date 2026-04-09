import { PartialType } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsArray, IsNumber } from 'class-validator';

export class CreateMateriaDto {

  @IsString()
  nombreMateria: string;

  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  cursosIds?: number[];

}

export class UpdateMateriaDto extends PartialType(CreateMateriaDto) { }
