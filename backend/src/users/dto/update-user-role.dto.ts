import { IsUUID, IsOptional, IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsUUID()
  @IsOptional()
  roleId?: string;
}
