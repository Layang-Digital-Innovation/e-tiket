import { IsString, IsNumber, Min, Max, IsOptional, IsEnum } from "class-validator";
import { RedeemStrategy } from "src/events/enums/event.enums";

export class RedeemDto {
    @IsString()
    ticketCode : string;

    @IsString()
    @IsOptional()
    itemCode?: string;

    @IsString()
    @IsOptional()
    wristbandCode?: string; // Legacy compatibility

    @IsString()
    eventId: string;

    @IsEnum(RedeemStrategy)
    @IsOptional()
    redeemStrategy?: RedeemStrategy;

    @IsOptional()
    additionalData?: any;
}

export class GenerateRedeemItemsDto {
    @IsString()
    ticketCategoryId: string;

    @IsNumber()
    @Min(1)
    @Max(10000)
    quantity: number;
}

export class JobStatusResponseDto {
    id: string;
    state: string;
    progress: number;
    data?: any;
    finishedOn?: Date;
    failedReason?: string;
    returnvalue?: any;
}
