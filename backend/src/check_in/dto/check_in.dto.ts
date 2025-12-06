import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CheckInDto {
    // New universal code field
    @IsOptional()
    @IsString()
    code?: string;

    // Legacy fields for backward compatibility
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
