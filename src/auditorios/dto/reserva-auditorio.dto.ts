import { PartialType } from '@nestjs/swagger';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateReservaAuditorioDto {
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    example: 1,
    description: 'ID del usuario que realiza la reserva',
  })
  idusuario: number;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  @ApiProperty({
    example: 1,
    description: 'ID del auditorio reservado',
  })
  idauditorio: number;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2026-06-18T08:00:00.000Z',
    description: 'Fecha y hora de la reserva',
  })
  fecha_hora: string;

  @IsDateString()
  @IsNotEmpty()
  @ApiProperty({
    example: '2026-06-18T10:00:00.000Z',
    description: 'Fecha y hora de finalizacion de la reserva',
  })
  fecha_hora_fin: string;

  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @ApiPropertyOptional({
    example: 4,
    description: 'ID de la asignacion asociada a la reserva',
  })
  idasignacion?: number;
}

export class UpdateReservaAuditorioDto extends PartialType(
  CreateReservaAuditorioDto,
) {}
