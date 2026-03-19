import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PolygonVertexDto } from './polygon-vertex.dto';

export class UpdateAreaDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(3)
  @ValidateNested({ each: true })
  @Type(() => PolygonVertexDto)
  polygon?: PolygonVertexDto[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
