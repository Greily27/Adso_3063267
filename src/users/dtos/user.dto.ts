/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsInt, IsBoolean, IsOptional } from "class-validator";
import { PartialType, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly names: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly lastNames: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly phone: string;

    
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly address: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly docType: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly document: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly photo: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly password: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    readonly email: string;

    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty()
    readonly isActive: boolean;

    @IsArray()
    @ArrayNotEmpty()
    @IsInt({ each: true })
    @Type(() => Number)
    @ApiProperty({ type: [Number] })
    readonly roleIds: number[];

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @Type(() => Number)
    @ApiPropertyOptional({ type: [Number] })
    readonly materiaIds?: number[];
}
export class UpdateUserDto extends PartialType(CreateUserDto) { }
