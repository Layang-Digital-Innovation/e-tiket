import { IsString } from "class-validator";

export class RedeemDto {
    @IsString()
    ticketCode : string;

    @IsString()
    wristbandCode : string;
}
