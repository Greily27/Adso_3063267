import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, Matches } from 'class-validator';
import { DiaHorario } from '../entities/horario.entity';

export class CreateHorarioDto {
  @IsEnum(DiaHorario)
  @IsNotEmpty()
  @ApiProperty({
    enum: DiaHorario,
    example: DiaHorario.Lunes,
    description: 'Dia de la semana del horario',
  })
  dia: DiaHorario;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @IsNotEmpty()
  @ApiProperty({
    example: '07:00',
    description: 'Hora de inicio en formato HH:mm',
  })
  horaInicio: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  @IsNotEmpty()
  @ApiProperty({
    example: '09:00',
    description: 'Hora de fin en formato HH:mm',
  })
  horaFin: string;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    example: 4,
    description: 'ID de la asignacion asociada al horario',
  })
  asignacionId: number;
}
