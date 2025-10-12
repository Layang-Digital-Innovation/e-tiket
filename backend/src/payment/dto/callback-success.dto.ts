import { IsArray, IsBoolean, IsISO8601, IsNumber, IsOptional } from "class-validator";

export interface ItemDto {
   name : string;
   price : number;
   quantity : number;
}

export class CallbackSuccessDto {

  @IsOptional()
  id: string;



  @IsArray()
  items: ItemDto[];

  @IsOptional()
  bank_code : string;

  @IsOptional()
  amount: number;

  @IsOptional()
  status: string;

  @IsOptional()
  created: string;

  @IsBoolean()
  is_high: boolean;

  @IsISO8601()
  @IsOptional()
  paid_at?: string;

 
  @IsOptional()
  payer_email: string;

  @IsISO8601()
  updated: string;

  @IsOptional()
  user_id: string;

 
  @IsOptional()
  currency: string;

 
  @IsOptional()
  payment_id: string;

 
  @IsOptional()
  description: string;

 
  @IsOptional()
  external_id: string;

  @IsNumber()
  @IsOptional()
  paid_amount: number;

  @IsOptional()
  ewallet_type: string;

  @IsOptional()
  merchant_name: string;

  @IsOptional()
  payment_method: string;

  @IsOptional()
  payment_channel: string;

  @IsOptional()
  payment_method_id: string;

  @IsOptional()
  payment_destination: string;

  @IsOptional()
  payment_details: {
    receipt_id: string;
    source : string;
  }

  @IsOptional()
  @IsOptional()
  adjusted_received_amount: string;

 
  @IsOptional()
  @IsOptional()
  failure_redirect_url: string;

  @IsOptional()
  @IsOptional()
  success_redirect_url: string;



}