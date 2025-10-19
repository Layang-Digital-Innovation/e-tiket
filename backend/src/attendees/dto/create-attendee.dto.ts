import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsOptional, IsDateString } from "class-validator";

export class CreateAttendeeDto {

      @IsString()
    @IsNotEmpty()
     fullName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    identityType?: string;

    @IsString()
    @IsOptional()
    identityNumber?: string;

    @IsPhoneNumber("ID")
    @IsNotEmpty()
    phoneNumber: string;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    address?: string;

    @IsDateString()
    @IsOptional()
    birthDate?: string;
}

