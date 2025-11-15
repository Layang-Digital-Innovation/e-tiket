import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CheckInDto {
    @IsOptional()
    @IsString()
    wristbandCode?: string;

    @IsOptional()
    @IsString()
    itemCode?: string;

    @IsOptional()
    @IsString()
    ticketCode?: string;
}
