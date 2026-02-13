import { IsString, IsOptional, Length } from 'class-validator';

export class RejectLeaveRequestDto {
  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;
}
