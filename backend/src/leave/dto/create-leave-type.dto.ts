import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  annualLimit: number;

  @IsBoolean()
  @IsOptional()
  carryForwardAllowed?: boolean;

  @IsInt()
  @IsOptional()
  maxCarryForward?: number;
}
