import {
  IsString,
  IsOptional,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
  IsUUID,
} from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @IsUUID()
  userId!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(8)
  @Matches(/^EMP\d{3,5}$/, {
    message:
      'Employee code must be in format EMP followed by 3-5 digits (e.g., EMP001)',
  })
  employeeCode!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  designationId?: string;

  @IsDateString()
  joinDate!: string;
}
