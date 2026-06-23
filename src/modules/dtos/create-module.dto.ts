import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateModuleDto {
  @ApiProperty({
    example: 'users',
    description: 'Nombre del modulo del sistema',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'User management module',
    description: 'Descripcion del modulo',
  })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateModuleDto extends PartialType(CreateModuleDto) {}
