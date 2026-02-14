import { IsString, IsOptional, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  employmentType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  openings?: number;
}
