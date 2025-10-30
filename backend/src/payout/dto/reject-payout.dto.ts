import { IsString } from 'class-validator';

export class RejectPayoutDto {
  @IsString()
  rejectionReason: string;
}
