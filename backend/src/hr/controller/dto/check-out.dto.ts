import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CheckOutDto {
  @IsString()
  @IsUUID()
  attendanceId!: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
