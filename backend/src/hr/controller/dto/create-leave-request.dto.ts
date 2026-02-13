import {
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  Length,
} from 'class-validator';

export type LeaveType =
  | 'annual'
  | 'sick'
  | 'casual'
  | 'maternity'
  | 'paternity'
  | 'bereavement'
  | 'unpaid'
  | 'other';

export class CreateLeaveRequestDto {
  @IsString()
  employeeId!: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

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
  leaveType!: LeaveType;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  reason?: string;
}
