import { IsNotEmpty, IsEmail, IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateAttendeeDto {
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phoneNumber?: string;

    @IsOptional()
    @IsString()
    identityType?: string;

    @IsOptional()
    @IsString()
    identityNumber?: string;

    @IsOptional()
    @IsString()
    gender?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsDateString()
    birthDate?: string;
}
