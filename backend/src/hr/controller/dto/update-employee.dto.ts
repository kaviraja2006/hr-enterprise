import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsUUID,
  IsIn,
} from 'class-validator';

export class UpdateEmployeeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  designationId?: string;

  @IsString()
  @IsIn(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';
}
