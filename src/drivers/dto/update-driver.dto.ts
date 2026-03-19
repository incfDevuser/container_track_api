import { IsString, IsOptional, IsEnum, IsDateString, MinLength, IsUUID } from 'class-validator';
import { DriverStatus } from 'generated/prisma/enums';

export class UpdateDriverDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  licenseType?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiresAt?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;
}
