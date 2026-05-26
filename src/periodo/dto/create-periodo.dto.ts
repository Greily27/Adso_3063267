import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreatePeriodoDto {
  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2026-01-15',
    description: 'Fecha inicial del periodo',
  })
  readonly fechaInicial: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2026-03-30',
    description: 'Fecha final del periodo',
  })
  readonly fechaFinal: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    example: 'Primer Periodo',
    description: 'Nombre del periodo academico',
  })
  readonly nombrePeriodo: string;
}
