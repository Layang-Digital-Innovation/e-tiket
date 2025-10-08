import { IsString } from "class-validator";

export class CallbackSuccessDto {
    @IsString()
    transactionCode: string;
}