import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreatePayrollRunDto {
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2020)
  year: number;

  @IsOptional()
  @IsString()
  status?: string;
}
