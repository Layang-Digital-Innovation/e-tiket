import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateOrderItemDto } from 'src/order_item/dto/create-order_item.dto';

export class ManualIssueOrderDto {
  @IsString()
  @IsNotEmpty()
  buyerFullName: string;

  @IsEmail()
  @IsNotEmpty()
  buyerEmail: string;

  @IsString()
  @IsNotEmpty()
  buyerPhoneNumber: string;

  @IsString()
  @IsOptional()
  buyerIdentityType?: string;

  @IsString()
  @IsOptional()
  buyerIdentityNumber?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsString()
  @IsOptional()
  paymentReference?: string;
}
