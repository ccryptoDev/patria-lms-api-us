import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class AddCardDto {
  @IsNotEmpty()
  @IsString()
  billingAddress1: string;

  @IsOptional()
  @IsString()
  billingAddress2: string;

  @IsNotEmpty()
  @IsString()
  billingCity: string;

  @IsOptional()
  @IsString()
  billingFirstName: string;

  @IsOptional()
  @IsString()
  billingLastName: string;

  @IsNotEmpty()
  @IsString()
  billingState: string;

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  @Length(5, 5)
  billingZip: string;

  @IsOptional()
  // @IsNumberString({ no_symbols: true })
  // @Length(3, 4)
  cardCode: string;

  @IsOptional()
  // @IsNumberString({ no_symbols: true })
  // @Length(3, 4)
  nameOnCard: string;

  @IsOptional()
  // @IsNumberString({ no_symbols: true })
  // @Length(15, 16)
  cardNumber: string;

  @IsOptional()
  // @IsNumberString({ no_symbols: true })
  // @Length(2, 2)
  expMonth: string;

  @IsOptional()
  // @IsNumberString({ no_symbols: true })
  // @Length(2, 2)
  expYear: string;

  @IsOptional()
  routingNumber: string;

  @IsOptional()
  accountNumber: string;

  @IsOptional()
  reaccountNumber: string;

  @IsOptional()
  financialInstitution: string;

  @IsOptional()
  accountType: string;

  @IsOptional()
  @IsString()
  isDefault: boolean;

  @IsNotEmpty()
  @IsString()
  paymentType: string;

  // Extracted from JWT
  screenTrackingId: string;
}
