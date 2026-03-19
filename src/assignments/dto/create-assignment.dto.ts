import { IsUUID, IsOptional, IsDateString } from 'class-validator';

export class CreateAssignmentDto {
  @IsUUID()
  driverId: string;

  @IsUUID()
  vehicleId: string;

  @IsOptional()
  @IsDateString()
  startAt?: string;

  @IsOptional()
  @IsDateString()
  endAt?: string;
}
