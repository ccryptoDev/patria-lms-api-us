import {
  IsDateString,
  IsNotEmpty,
  IsPositive,
  IsUUID,
  IsString,
  IsOptional,
} from 'class-validator';

export class SubmitPaymentDto {
  // @IsNotEmpty()
  // @IsUUID('4')
  // paymentMethodToken: string;

  @IsString()
  @IsOptional(null)
  paymentMethodToken: string;

  @IsPositive()
  amount: number;

  @IsDateString()
  paymentDate: Date;

  @IsString()
  @IsOptional()
  paymentVia?: string;

  screenTracking?: string;
}
