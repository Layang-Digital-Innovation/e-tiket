import { IsString, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { BankType } from '../entities/payout.entity';

export class CreatePayoutDto {
  @IsNumber()
  @Min(0)
  netAmount: number;

  @IsString()
  bankAccountName: string;

  @IsString()
  bankAccountNumber: string;

  @IsEnum(BankType)
  bankType: BankType;

  @IsOptional()
  @IsString()
  bankBranch?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  eventId?: string;
}
