import { PartialType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAuditorioDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Auditorio principal',
    description: 'Nombre del auditorio',
  })
  nombre: string;
}

export class UpdateAuditorioDto extends PartialType(CreateAuditorioDto) {}
