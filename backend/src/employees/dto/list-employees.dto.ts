import { IsUUID, IsOptional, IsString } from 'class-validator';

export class ListEmployeesDto {
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsUUID()
  @IsOptional()
  managerId?: string;

  @IsString()
  @IsOptional()
  employmentStatus?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
