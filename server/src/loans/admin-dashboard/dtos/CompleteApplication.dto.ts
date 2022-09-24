export interface CompleteApplicationDto {
  userId: string;
  screenTrackingId: string;
  pmId: string;
  name: string;
  approvedUpTo: number;
  selectedAmount: number;
  dateCreated: Date;
  phone: string;
  email: string;
  location: string;
  loanAmount: number;
  interestRate: number;
  term: number;
}
