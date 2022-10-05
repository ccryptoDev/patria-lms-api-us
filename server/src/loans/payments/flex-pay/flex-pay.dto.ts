import {
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ScreenTrackingDocument } from 'src/user/screen-tracking/screen-tracking.schema';
import { UserDocument } from 'src/user/user.schema';

export interface FlexReturnPayload {
  ok: boolean;
  error?: string;
  data: any;
}

export interface FlexTransactionCommit {
  transaction?: {
    uniqueId: string;
    yourReferenceNumber: string;
    nameOnCard?: string;
    cardNumberLastFour?: string;
    amount: number;
    acceptorName: string;
    acceptorId: string;
    receivedDateTime: string;
    completedDateTime: string;
    status?: string;
    statusCode?: null | number | string;
    statusDescription?: null | string;
    settlementDate: null | string;
    reversalReceivedDateTime: null | string;
    reversalCompletedDateTime: null | string;
    reversalSettlementDate: null | string;
    reversalStatus: null | string;
    reversalStatusCode: null | string;
    reversalStatusDescription: null | string;
    // ach
    achItemId?: number;
    flexBatchId?: string;
    merchantId?: number;
    itemStatus?: string;
    itemStatusDescription?: string;
    firstSignerFirstName?: string;
    firstSignerLastName?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    zip?: string;
    homePhone?: string;
    workPhone?: string;
    cellPhone?: string;
    email?: string;
    dob?: Date;
    ssn?: string;
    driversLicenseNo?: string;
    driversLicenseState?: string;
    passport1?: string;
    passport2?: string;
    militaryId1?: string;
    militaryId2?: string;
    otherId?: string;
    notes?: string;
    bankRoutingNumber?: string;
    bankAccountNumber?: string;
    returnReason?: string;
    returnMessage?: string;
    itemSource?: string;
    returnItemId?: number;
    reportStatus: string;
    settleDate?: Date;
    returnDate?: Date;
    achEffectiveDate?: Date;
    depositDateTime?: null;
    apiReportDateTime?: null;
    sendDate?: Date;
    bankId?: number;
    achTransactionCode: number;
    achAccountType: string;
    achTransactionType: string;
    achTransactionSubType: string;
    achEntryClass: string;
    achPaymentTypeCode: string;
    achCheckNumber: number;
    achIdentificationNumber: string;
    achCompanyEntryDescription: string;
    achCompanyDiscretionaryData: string;
    achTransactionDiscretionaryData: string;
    achAddendaText: string;
    sameDayAchRequested: boolean;
    returnFileName: string;
    settlementReportFileName: string;
    returnReportFileName: string;
  };
  userData: {
    userId: string | UserDocument;
    screenTrackingId: string | ScreenTrackingDocument;
    paymentType: 'ACH' | 'CARD';
    paymentRef?: string;
  };
}

export interface DisbursePayload {
  screenTracking: ScreenTrackingDocument;
  user: any;
  bankData: DisburseBankData;
  amount: number;
}

export interface DisburseBankData {
  routingNumber: string;
  accountNumber: string;
}

export enum FLEX_CHARGE_STATUS {
  'SETTLED' = 'settled',
  'FAILED' = 'failed',
  'PENDING' = 'pending',
}
