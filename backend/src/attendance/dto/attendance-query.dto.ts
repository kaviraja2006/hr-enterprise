import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class AttendanceQueryDto {
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  status?: string;
}
