import { IsUUID, IsDateString, IsOptional, IsString } from 'class-validator';

export class CheckOutDto {
  @IsUUID()
  employeeId: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
