import { IsString, IsOptional, IsIn, IsUUID } from 'class-validator';

export class ListEmployeesQueryDto {
  @IsString()
  @IsIn(['active', 'inactive'])
  @IsOptional()
  status?: 'active' | 'inactive';

  @IsString()
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsString()
  @IsUUID()
  @IsOptional()
  designationId?: string;

  @IsString()
  @IsOptional()
  search?: string;
}
