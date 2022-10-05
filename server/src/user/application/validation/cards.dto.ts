import { IsNotEmpty, IsString } from 'class-validator';

export class CardsDto {
  paymentMethodToken?: string;

  @IsNotEmpty()
  @IsString()
  paymentId: string;
}
