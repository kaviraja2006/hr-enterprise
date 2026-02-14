import { IsString, IsOptional, IsNumber, IsDateString, IsUUID, Min, Max } from 'class-validator';

export class CreateGoalDto {
  @IsUUID()
  employeeId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  targetValue: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  achievedValue?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  weightage?: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
