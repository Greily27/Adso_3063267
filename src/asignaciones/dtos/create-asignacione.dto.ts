import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateAsignacioneDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    example: 1,
    description: 'ID del curso al que pertenece la asignacion',
  })
  cursoId: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    example: 1,
    description: 'ID de la materia asignada',
  })
  materiaId: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    example: 1,
    description: 'ID del usuario docente asignado',
  })
  docenteId: number;
}
