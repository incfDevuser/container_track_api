import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { VehicleStatus } from 'generated/prisma/enums';

export class CreateVehicleDto {
  @IsUUID()
  companyId: string;

  @IsString()
  plate: string;

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
