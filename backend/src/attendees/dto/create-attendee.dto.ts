import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsOptional, IsDateString } from "class-validator";

export class CreateAttendeeDto {

      @IsString()
    @IsNotEmpty()
     fullName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    identityType: string;

    @IsString()
    @IsNotEmpty()
    identityNumber: string;

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

