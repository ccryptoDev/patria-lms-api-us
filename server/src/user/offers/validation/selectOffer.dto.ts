import { IsBoolean, IsMongoId, IsNotEmpty } from 'class-validator';

export class SelectOfferDto {
  @IsNotEmpty()
  @IsMongoId()
  loanId: string;

  @IsBoolean()
  promoSelected: boolean;

  @IsBoolean()
  skipAutoPay: boolean;

  // Extracted from JWT
  screenTrackingId: string;
}
