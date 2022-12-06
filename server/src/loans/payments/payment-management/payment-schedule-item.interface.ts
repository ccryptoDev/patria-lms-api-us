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

export enum COMMUNICATION_CODE {
  LDA = 'LDA',
  COAL = 'COAL',
  COA = 'COA',
}

export const UNDERWRITING_RULES = {
  $1_DUPLICATE_APPLICATION: {
    title: 'Duplicate Application',
    ruleId: 's1_app_1',
    ruleNumber: 1,
    executionGroup: 1,
    ruleFileName: '1.isDuplicated',
    communicationCode: '',
  },
  $2_BLOCKED_STATES: {
    title: 'Blocked States',
    ruleId: 's1_app_2',
    ruleNumber: 2,
    executionGroup: 1,
    ruleFileName: '2.checkForBlockedStates',
    communicationCode: '',
  },
  $3_CURRENT_CUSTOMER_SCREEN: {
    title: 'Current Customer Screen',
    ruleId: 's1_app_3',
    ruleNumber: 3,
    executionGroup: 2,
    ruleFileName: '3.checkUserHasOpenLoan',
    communicationCode: '',
  },
  $4_CHECK_DNL_LIST: {
    title: 'Check DNL List',
    ruleId: 's1_app_4',
    ruleNumber: 4,
    executionGroup: 2,
    ruleFileName: '4.checkInDnlList',
    communicationCode: '',
  },
  $5_CLARITY_CLEAR_INQUIRE: {
    title: 'Clarity Clear Inquiry',
    ruleId: 's2_bu_1',
    ruleNumber: 5,
    executionGroup: 2,
    ruleFileName: '5.clarityClearInquiry',
    communicationCode: '',
  },
  $6_TRANSUNION_FRAUD_VALIDATION: {
    title: 'TransUnion TrueValidate Fraud Risk',
    ruleId: 's3_bu_1',
    ruleNumber: 6,
    executionGroup: 2,
    ruleFileName: '6.TrueValidateFraudRisk',
    communicationCode: '',
  },
  $7_MINIMUM_INCOME: {
    title: 'Minimum Income',
    ruleId: 's1_app_5',
    ruleNumber: 7,
    executionGroup: 3,
    ruleFileName: '7.minimumIncome',
    communicationCode: '',
  },
  $8_CLARITY_CLEAR_CREDIT: {
    title: 'Clarity Clear Credit',
    ruleId: 's2_bu_2',
    ruleNumber: 8,
    executionGroup: 3,
    ruleFileName: '8.clarityClearCredit',
    communicationCode: '',
  },
  $9_FACTOR_TRUST_CALL: {
    title: 'Factor Trust Delinquency Risk Check',
    ruleId: 's3_bu_2',
    ruleNumber: 9,
    executionGroup: 3,
    ruleFileName: '9.factorTrustDelinquencyRiskCheck',
    communicationCode: '',
  },
  $10_DUAL_SCORE: {
    title: 'Dual Score',
    ruleId: 's1_app_6',
    ruleNumber: 10,
    executionGroup: 3,
    ruleFileName: '10.DualScore',
    communicationCode: '',
  },
  $11_ASSIGN_APR: {
    title: 'Calculate APR',
    ruleId: 's1_app_7',
    ruleNumber: 11,
    executionGroup: 3,
    ruleFileName: '11.AssignAPR',
    communicationCode: '',
  },
  $12_MINIMUM_PAYMENT: {
    title: 'Calculate Maximum Payment',
    ruleId: 's1_app_8',
    ruleNumber: 12,
    executionGroup: 3,
    ruleFileName: '12.calculateMaximumPayment',
    communicationCode: '',
  },
  $13_MAXIMUM_LOAN_AMOUNT: {
    title: 'Calculate Maximum Loan Amount',
    ruleId: 's1_app_9',
    ruleNumber: 13,
    executionGroup: 3,
    ruleFileName: '13.calculateMaximumLoanAmount',
    communicationCode: 'COAL',
  },
  $14_LOAN_AMOUNT_ASSIGNMENT: {
    title: 'Loan Amount Assignment',
    ruleId: 's1_app_10',
    ruleNumber: 14,
    executionGroup: 3,
    ruleFileName: '14.loanAmountAssignment',
    communicationCode: '',
  },
  $15_LOAN_TERM_OPTION: {
    title: 'Loan Term Options',
    ruleId: 's1_app_11',
    ruleNumber: 15,
    executionGroup: 3,
    ruleFileName: '15.loanTermOptions',
    communicationCode: '',
  },
  $17_REQUEST_BANK_DETAILS: {
    title: 'Request Bank Details',
    ruleId: 's3_bu_3',
    ruleNumber: 17,
    executionGroup: 4,
    ruleFileName: '17.requestBankDetails',
    communicationCode: '',
  },
  $18_CLARITY_CLEAR_INQUIRY: {
    title: 'Clarity Clear Fraud Insight',
    ruleId: 's2_bu_3',
    ruleNumber: 18,
    executionGroup: 4,
    ruleFileName: '18.clarityClearInquiry',
    communicationCode: '',
  },
  $19_CLARITY_CLEAR_FRAUD: {
    title: 'Clarity Clear Fraud',
    ruleId: 's2_bu_4',
    ruleNumber: 19,
    executionGroup: 4,
    ruleFileName: '19.clarityClearFraud',
    communicationCode: '',
  },
  $20_CLEAR_BANK_CALL: {
    title: 'Clear Bank Call',
    ruleId: 's2_bu_5',
    ruleNumber: 20,
    executionGroup: 4,
    ruleFileName: '20.clearBankCall',
    communicationCode: COMMUNICATION_CODE.LDA,
  },
};

// user not signed the document < 6  and > 4 and ruleId: s2_bu_5  and status should be passed
// conditional approved on step3
