import { IsString, IsOptional, IsNumber, IsDateString, IsUUID } from 'class-validator';

export class CreateFilingRecordDto {
  @IsString()
  type: string; // PF, ESI, TDS, GST

  @IsString()
  period: string; // e.g., "2024-01", "Q1-2024"

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  receiptNo?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
