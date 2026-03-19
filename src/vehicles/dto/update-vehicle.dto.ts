import { IsString, IsOptional, IsEnum } from 'class-validator';
import { VehicleStatus } from 'generated/prisma/enums';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  plate?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsString()
  gpsExternalId?: string;
}
