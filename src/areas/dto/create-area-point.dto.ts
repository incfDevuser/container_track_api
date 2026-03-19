import {
  IsBoolean,
  IsDateString,
  IsLatitude,
  IsLongitude,
  IsOptional,
} from 'class-validator';

export class CreateAreaPointDto {
  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;

  @IsOptional()
  @IsDateString()
  estimatedAt?: string;

  @IsOptional()
  @IsBoolean()
  isVehicleInPoint?: boolean;
}
