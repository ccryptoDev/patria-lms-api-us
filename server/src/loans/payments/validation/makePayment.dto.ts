import {
  IsEnum,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class MakePaymentDto {
  // Extracted from JWT
  user: string;

  @IsPositive()
  amount: number;

  @IsNotEmpty()
  @IsUUID('4')
  paymentMethodToken: string;
}

export enum PaymentType {
  ACH = 'ACH',
  CARD = 'CARD',
}

export enum AchTransactionCode {
  CREDIT = 22,
  DEBIT = 27,
}

export class MakePaymentFlexDto {
  screenTrackingId: string;

  @IsPositive()
  amount: number;

  @IsEnum(PaymentType)
  type: PaymentType;
}

export class DisburseAmountDto {
  @IsPositive()
  amount: number;
}
