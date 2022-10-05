import { IPaymentScheduleStatusItem } from './payment-schedule-transactionstatus.interface';

export interface IPaymentScheduleItem {
  amount: number;
  date: Date;
  endPrincipal: number;
  fees: number;
  nsfFee: number;
  interest: number;
  week?: number;
  paidFees: number;
  paidInterest: number;
  paidPastDueInterest: number;
  paidPrincipal: number;
  pastDueInterest: number;
  payment: number;
  paymentDate?: Date | undefined;
  paymentId?: string;
  paymentReference?: string | undefined;
  paymentType: 'manual' | 'automatic';
  principal: number;
  startPrincipal: number;
  startTotalBalance?: number;
  status:
    | 'opened'
    | 'pending'
    | 'paid'
    | 'failed'
    | 'declined'
    | 'returned'
    | 'processing';
  transactionId: string;
  isRefund?: boolean | false;
  isWaived?: boolean | false;
  amendedAmount?: number | 0;
  isAmended?: boolean | false;
  refundDate?: Date | undefined;
  refundAmount?: number | 0;
  transactionMessage?: string | undefined;
  transId?: string | undefined;
  transactionStatus?: IPaymentScheduleStatusItem[] | undefined;
  lateFeeApplied?: boolean | false;
  nsfFeeApplied?: boolean | false;
  accuredBalance?: number | 0;
}
