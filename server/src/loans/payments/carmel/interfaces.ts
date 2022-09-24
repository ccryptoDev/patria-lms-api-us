export interface IPaymentData {
  createPaymentOrderDto: Record<string, any>;
  transactionId: string;
  originationAccountId: string;
}

export interface ICreatePaymentOrderPayload {
  paymentOrder: Record<string, any>;
}

export interface ApiResource<T, K> {
  path: string;
  method: string;
  parser?: (data: T) => K;
}

export interface IOriginationInstitution {
  id: string;
  name: string;
}

export interface IOriginationAccount {
  accountNumber: string;
  achEnabled: boolean;
  achCreditEnabled: boolean;
  achDebitEnabled: boolean;
  id: string;
  name: string;
  originationInstitution: IOriginationInstitution;
  outboundCompanyName: string;
  routingNumber: string;
  sameDayCreditEnabled: boolean;
  sameDayDebitEnabled: boolean;
  status: string;
  supplementalDataKeys: string[];
  wireEnabled: boolean;
}
