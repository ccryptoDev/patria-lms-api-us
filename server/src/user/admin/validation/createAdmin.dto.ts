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
  MANAGER = 'Manager - LA'
}
export class CreateAdminDto {
  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsOptional()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  @MinLength(10)
  @MaxLength(10)
  phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(AdminRoles)
  role: AdminRoles;

  // @ValidateIf((o) => o.role !== 'Super Admin')
  // @IsNotEmpty()
  // @IsMongoId()
  // practiceManagement: string;
}
