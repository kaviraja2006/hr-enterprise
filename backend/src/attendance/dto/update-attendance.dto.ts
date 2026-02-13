import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @IsDateString()
  @IsOptional()
  checkIn?: string;

  @IsDateString()
  @IsOptional()
  checkOut?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
