/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsArray, ArrayNotEmpty, IsInt, IsBoolean } from "class-validator";
import { PartialType, ApiProperty } from "@nestjs/swagger";
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
}
export class UpdateUserDto extends PartialType(CreateUserDto) { }