import { IsString, IsNotEmpty, IsNumber } from "class-validator";


export class CreateTicketCategoryDto {
    @IsString()
    @IsNotEmpty()
    name: string;
    
    @IsString()
    @IsNotEmpty()
    eventId: string;

     @IsNumber()
    @IsNotEmpty()
    price: number;

     @IsNumber()
    @IsNotEmpty()
    maxQuantity: number;

    @IsString()
    @IsNotEmpty()
    description: string;

}
