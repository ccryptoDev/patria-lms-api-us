export default interface IOffer {
  adjWeightMax: number;
  apr: number;
  canUsePromo: boolean;
  decimalAmount: string;
  downPayment: number;
  dtiMax: number;
  dtiMin: number;
  ficoMax: number;
  ficoMin: number;
  financeCharge: number;
  financedAmount: number;
  fullNumberAmount: string;
  fundingSource: string;
  grade: string;
  interestRate: number;
  loanAmount: number;
  loanId: string;
  maxLoanAmt: number;
  minLoanAmt: number;
  monthlyPayment: number;
  paymentFrequency: string;
  postDTI: number;
  promoApr: number;
  promoDecimalAmount: string;
  promoFinanceCharge: number;
  promoFullNumberAmount: string;
  promoInterestRate: number;
  promoMonthlyPayment: number;
  promoPostDTI: number;
  promoSelected: boolean;
  promoTerm: number;
  promoTotalLoanAmount: number;
  term: number;
  totalLoanAmount: number;
}
