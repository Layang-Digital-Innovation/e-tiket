import { PartialType } from '@nestjs/mapped-types';
import { RedeemDto } from './create-redeem.dto';

export class UpdateRedeemDto extends PartialType(RedeemDto) {}
