import { APPROVAL_STATUS } from './approval.schema';

export enum CollectionName {
  USER_COLLECTION = 'user',
  SCREEN_COLLECTION = 'screenTracking',
  PAYMENT_MANAGEMENT_COLLECTION = 'paymentManagement',
}

export interface APPROVAL_CREATE_TYPE {
  email: string;
  agent: string;
  user: string;
  fieldToUpdate: Array<{ key: string; value: string }>;
  description: string;
  currentValue: Array<{ key: string; value: string }>;
  collectionName: CollectionName;
}

export interface ACTION_PAYLOAD {
  status: APPROVAL_STATUS;
  approvalId: string;
}
