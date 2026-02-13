import {
  IsString,
  IsOptional,
  IsDateString,
  IsIn,
  IsUUID,
} from 'class-validator';

export class AttendanceQueryDto {
  @IsString()
  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsIn(['present', 'absent', 'late', 'half-day', 'on-leave'])
  @IsOptional()
  status?: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave';

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
