import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

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
}

