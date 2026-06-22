import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGuiaDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Guia de lectura 1',
    description: 'Nombre de la guia',
  })
  nombreGuia: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Actividades para desarrollar en clase',
    description: 'Descripcion de la guia',
  })
  descripcion: string;

  @IsOptional()
  @IsNotEmpty()
  @ApiProperty({
    example: true,
    description: 'Estado de la guia',
  })
  estado: boolean | string;

  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: 'ID de la asignacion asociada',
  })
  asignacionId: number | string;
}
