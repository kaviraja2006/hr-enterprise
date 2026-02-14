import { IsString, IsOptional, IsNumber, IsUUID, Min, Max } from 'class-validator';

export class CreatePerformanceReviewDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  reviewerId: string;

  @IsString()
  reviewPeriod: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  strengths?: string;

  @IsOptional()
  @IsString()
  improvements?: string;
}
