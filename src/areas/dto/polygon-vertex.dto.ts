import { IsLatitude, IsLongitude } from 'class-validator';

export class PolygonVertexDto {
  @IsLatitude()
  latitude: number;

  @IsLongitude()
  longitude: number;
}
