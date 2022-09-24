import { PaymentManagementDocument } from '../../payments/payment-management/payment-management.schema';
import { UserDocument } from '../../../user/user.schema';
import { ScreenTrackingDocument } from '../../../user/screen-tracking/screen-tracking.schema';
import { PracticeManagementDocument } from '../../practice-management/practice-management.schema';

export type PopulatedPaymentManagement = Omit<
  PaymentManagementDocument,
  'user' | 'screenTracking' | 'practiceManagement'
> & {
  user: UserDocument;
  screenTracking: ScreenTrackingDocument;
  practiceManagement: PracticeManagementDocument;
};

export type PopulatedScreenTracking = Omit<
  ScreenTrackingDocument,
  'user' | 'practiceManagement'
> & {
  user: UserDocument;
  practiceManagement: PracticeManagementDocument;
};

export const SCREEN_LEVEL = {
  PERSONAL_INFO: 1,
  EMPLOYMENT_INFO: 2,
  CHOOSE_OFFER: 3,
  BANK_INFO: 4,
  REVIEW_APPLICATION: 5,
  SIGN_CONTRACT: 6,
  FUNDING_METHOD: 7,
  THANK_YOU: 8,
};
