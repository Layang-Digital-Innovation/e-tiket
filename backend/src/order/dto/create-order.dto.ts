import { Type } from "class-transformer";
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, ValidateNested } from "class-validator";
import { CreateOrderItemDto } from "src/order_item/dto/create-order_item.dto";

export class CreateOrderDto {
    // Informasi Pembeli
    @IsString()
    @IsNotEmpty()
    buyerFullName: string;



    @IsEmail()
    @IsNotEmpty()
    buyerEmail: string;

    @IsString()
    @IsOptional()
    buyerIdentityType?: string;

    @IsString()
    @IsOptional()
    buyerIdentityNumber?: string;

    @IsString()
    @IsNotEmpty()
    buyerPhoneNumber: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];
}
