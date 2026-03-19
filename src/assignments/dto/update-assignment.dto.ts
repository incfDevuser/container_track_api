import { IsOptional, IsDateString } from 'class-validator';

export class UpdateAssignmentDto {
  @IsOptional()
  @IsDateString()
  endAt?: string;
}
