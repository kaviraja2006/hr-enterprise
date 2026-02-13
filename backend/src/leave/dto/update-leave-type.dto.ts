import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class UpdateLeaveTypeDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  annualLimit?: number;

  @IsBoolean()
  @IsOptional()
  carryForwardAllowed?: boolean;

  @IsInt()
  @IsOptional()
  maxCarryForward?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
