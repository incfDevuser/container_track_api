import { IsEmail, IsString, MinLength, IsBoolean, IsOptional } from "class-validator";

export class CreateCarrierDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(2)
    name: string;

    @IsOptional()
    @IsString()
    @MinLength(9)
    phone?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
