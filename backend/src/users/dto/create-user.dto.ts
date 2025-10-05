import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { UserRole, UserStatus } from '../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  profileImage?: string;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @IsOptional()
  @IsString()
  emailVerificationToken?: string;

  @IsOptional()
  @IsDate()
  emailVerificationExpires?: Date;

  @IsOptional()
  @IsString()
  oauthProvider?: string;

  @IsOptional()
  @IsString()
  oauthProviderId?: string;
}
