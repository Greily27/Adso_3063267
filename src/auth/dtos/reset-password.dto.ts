import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'TOKEN_AQUI' })
  readonly token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @ApiProperty({ example: 'nuevaContrasena123' })
  readonly password: string;
}
