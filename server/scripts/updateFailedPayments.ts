import mongoose, { Model } from 'mongoose';
import {
  ScreenTracking,
  ScreenTrackingSchema,
} from '../src/user/screen-tracking/screen-tracking.schema';
import {
  PaymentManagement,
  PaymentManagementDocument,
  PaymentManagementSchema,
} from '../src/loans/payments/payment-management/payment-management.schema';
import { UserSchema } from '../src/user/user.schema';
import { IPaymentScheduleItem } from 'src/loans/payments/payment-management/payment-schedule-item.interface';
const connectDB = async () => {
  try {
    const uri = 'mongodb://localhost:27017/patria';
    await mongoose
      .connect(uri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      })
      .catch((error) => console.log(error));
    const connection = mongoose.connection;
    console.log('MONGODB CONNECTED SUCCESSFULLY!');
  } catch (error) {
    console.log(error);
    return error;
  }
};
const screenTrackingModel = mongoose.model(
  ScreenTracking.name,
  ScreenTrackingSchema,
);
const paymentmanagementModel = mongoose.model(
  PaymentManagement.name,
  PaymentManagementSchema,
);
const userModel = mongoose.model('User', UserSchema);
async function closeDB() {
  console.log('CLOSING CONNECTION');
  await mongoose.disconnect();
}
connectDB();
const connectScreen = async () => {
  try {
    console.log('STARTING');
    const loansToUpdate = [
      {
        loanId: '62f42eaaeaecac5dbbc8e7b9',
        paymentRef: ['PMT_98'],
      },
    ];

    const inRepaymentLoans = (await paymentmanagementModel.find({
      $and: [
        {
          screenTracking: {
            $in: loansToUpdate.map((config) => config.loanId),
          },
        },
        {
          status: {
            $in: [
              'in-repayment',
              'in-repayment prime',
              'in-repayment non-prime',
              'in-repayment delinquent1',
              'in-repayment delinquent2',
              'in-repayment delinquent3',
              'in-repayment delinquent4',
            ],
          },
        },
      ],
    })) as PaymentManagementDocument[];

    console.log('Updating loans: ', inRepaymentLoans.length);

    // const args = process.argv.slice();

    // console.log({ args });

    for (const paymentManagement of inRepaymentLoans) {
      const { paymentSchedule } = paymentManagement;

      const newPaymentSchedule = [...paymentSchedule];

      paymentSchedule.forEach((payment, index) => {
        if (
          loansToUpdate.some(
            (config) =>
              config.paymentRef.includes(payment.paymentReference) &&
              payment.status === 'paid',
          )
        ) {
          newPaymentSchedule[index] = Object.create({
            ...payment,
            paidPrincipal: 0,
            endPrincipal: payment.startPrincipal,
            status: 'failed',
          }) as IPaymentScheduleItem;

          const delinquentPayment = Object.create({
            ...payment,
            status: 'opened',
            paidPrincipal: 0,
            endPrincipal: payment.startPrincipal,
          }) as IPaymentScheduleItem;

          newPaymentSchedule.push(delinquentPayment);
        }
      });

      // console.log({ newPaymentSchedule });
      await Object.assign(paymentManagement, {
        paymentSchedule: newPaymentSchedule.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        ),
      }).save();
    }

    console.log('DONE');
    await closeDB();
  } catch (error) {
    console.log(error);
    return error;
  }
};
connectScreen();
