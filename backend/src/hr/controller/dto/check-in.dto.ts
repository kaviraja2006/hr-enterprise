import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CheckInDto {
  @IsString()
  @IsUUID()
  employeeId!: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
