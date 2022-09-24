export interface promisetoPay {
  paymentId: string;
  isRemovingSchedule: boolean;
  promiseScheduleDate: string;
  promiseScheduleTime: string;
  promiseScheduleStatus: string;
  promiseDescription: string;
  promisedPayAmount: number;
  customerContacted: boolean;
  newPromiseDate?: string;
}
