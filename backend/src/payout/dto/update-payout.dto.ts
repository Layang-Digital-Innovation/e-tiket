import { IsString, IsOptional, IsEnum } from 'class-validator';
import { PayoutStatus } from '../entities/payout.entity';

export class UpdatePayoutDto {
  @IsOptional()
  @IsEnum(PayoutStatus)
  status?: PayoutStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;
}
