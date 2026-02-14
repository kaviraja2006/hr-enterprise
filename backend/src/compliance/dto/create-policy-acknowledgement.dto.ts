import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreatePolicyAcknowledgementDto {
  @IsUUID()
  employeeId: string;

  @IsString()
  policyName: string;

  @IsOptional()
  @IsString()
  policyVersion?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
