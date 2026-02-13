import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class UpdateAttendanceDto {
  @IsString()
  @IsIn(['present', 'absent', 'late', 'half-day', 'on-leave'])
  @IsOptional()
  status?: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  attendanceId?: string;
}
