import { 
  IsArray, 
  IsBoolean, 
  IsEnum, 
  IsISO8601, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

/**   
 * Xendit Payment Link Item DTO
 */
export class XenditItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  category?: string;
}

/**
 * Xendit Payment Status Enum
 */
export enum XenditPaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED'
}

/**
 * Xendit Payment Details (optional)
 */
export class XenditPaymentDetailsDto {
  @IsOptional()
  @IsString()
  receipt_id?: string;

  @IsOptional()
  @IsString()
  source?: string;
}

/**
 * Xendit Webhook Callback DTO
 * Based on official Xendit Payment Link webhook payload
 * @see https://docs.xendit.co/payment-link/notification-and-callback
 */
export class CallbackSuccessDto {
  // Required fields
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  external_id: string;

  @IsEnum(XenditPaymentStatus)
  status: XenditPaymentStatus;

  @IsNumber()
  amount: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => XenditItemDto)
  items: XenditItemDto[];

  @IsISO8601()
  created: string;

  @IsISO8601()
  updated: string;

  @IsString()
  currency: string;

  @IsBoolean()
  is_high: boolean;

  @IsString()
  user_id: string;

  // Optional fields (only present when payment is successful)
  @IsOptional()
  @IsISO8601()
  paid_at?: string;

  @IsOptional()
  @IsNumber()
  paid_amount?: number;

  @IsOptional()
  @IsString()
  payment_id?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  payment_channel?: string;

  @IsOptional()
  @IsString()
  payment_method_id?: string;

  // E-wallet specific
  @IsOptional()
  @IsString()
  ewallet_type?: string;

  // Virtual Account specific
  @IsOptional()
  @IsString()
  bank_code?: string;

  // Credit Card specific fields
  @IsOptional()
  @IsString()
  credit_card_token?: string;

  @IsOptional()
  @IsString()
  credit_card_charge_id?: string;

  @IsOptional()
  @IsString()
  card_type?: string;

  @IsOptional()
  @IsString()
  masked_card_number?: string;

  @IsOptional()
  @IsString()
  card_brand?: string;

  @IsOptional()
  @IsString()
  authorization_id?: string;

  // Additional payment fields
  @IsOptional()
  @IsString()
  payer_email?: string;

  @IsOptional()
  @IsString()
  merchant_name?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => XenditPaymentDetailsDto)
  payment_details?: XenditPaymentDetailsDto;


  @IsOptional()
  @IsString()
  success_redirect_url?: string;

  @IsOptional()
  @IsString()
  failure_redirect_url?: string;
}
