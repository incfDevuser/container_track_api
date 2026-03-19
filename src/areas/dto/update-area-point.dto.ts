import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class UpdateAreaPointDto {
  @IsOptional()
  @IsDateString()
  estimatedAt?: string;

  @IsOptional()
  @IsBoolean()
  isVehicleInPoint?: boolean;
}
