import { IsString, IsOptional } from 'class-validator';

export class ApprovePayoutDto {
  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
