import { IsOptional, IsUUID, IsDateString } from 'class-validator';

export class AuditDto {
  @IsDateString()
  @IsOptional()
  createdAt?: Date;

  @IsDateString()
  @IsOptional()
  updatedAt?: Date;

  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @IsUUID()
  @IsOptional()
  updatedBy?: string;
}

export class AuditResponseDto {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  updater?: {
    id: string;
    name: string;
    email: string;
  };
}