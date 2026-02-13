import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export class LeaveRequestQueryDto {
  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected', 'cancelled'])
  status?: LeaveStatus;

  @IsOptional()
  @IsDateString()
  startDateFrom?: string;

  @IsOptional()
  @IsDateString()
  startDateTo?: string;

  @IsOptional()
  @IsEnum([
    'annual',
    'sick',
    'casual',
    'maternity',
    'paternity',
    'bereavement',
    'unpaid',
    'other',
  ])
  leaveType?: string;
}
