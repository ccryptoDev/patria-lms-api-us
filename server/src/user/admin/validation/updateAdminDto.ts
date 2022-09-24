import {
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

enum AdminRoles {
  ADMIN = 'Super Admin',
  SALES_REP = 'Agent',
}

export class UpdateAdminDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  @MinLength(10)
  @MaxLength(10)
  phoneNumber: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(AdminRoles)
  role: AdminRoles;

  @ValidateIf((o) => o.role !== 'Super Admin')
  @IsNotEmpty()
  @IsMongoId()
  practiceManagement: string;
}
