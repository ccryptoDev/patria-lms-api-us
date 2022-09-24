import { IsNotEmpty, IsNumberString, Length } from 'class-validator';

export class ValidateCardDto {
  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  @Length(3, 3)
  cardCode: string;

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  @Length(16, 16)
  cardNumber: string;

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  @Length(2, 2)
  expMonth: string;

  @IsNotEmpty()
  @IsNumberString({ no_symbols: true })
  @Length(2, 2)
  expYear: string;
}
