import { IsPositive, ValidateIf } from 'class-validator';

export class LoanSettingsDto {
  @IsPositive()
  lateFee: number | null;

  @IsPositive()
  @ValidateIf((object, value) => value !== null)
  nsfFee!: number | null;
  // nsfFee: number | null;

  @IsPositive()
  lateFeeGracePeriod: number | null;

  @IsPositive()
  @ValidateIf((object, value) => value !== null)
  delinquencyPeriod: number | null;

  eventsUrl: string | null;

  eventsAuthToken: string;
}

export enum ReviewStatusEnum {
  APPROVED = 'approved',
  DENIED = 'denied',
}
export class StatusApproval {
  screentrackingId: string | null;
  status: ReviewStatusEnum;
}
