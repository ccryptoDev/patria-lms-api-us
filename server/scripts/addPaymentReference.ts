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
import {
  FlexTransactionReport,
  FlexTransactionReportDocument,
  FlexTransactionReportSchema,
} from '../src/loans/payments/flex-pay/flex.schema';
import moment from 'moment';
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

const flexTransactionReportModel = mongoose.model(
  FlexTransactionReport.name,
  FlexTransactionReportSchema,
);

async function closeDB() {
  console.log('CLOSING CONNECTION');
  await mongoose.disconnect();
}
connectDB();
const connectScreen = async () => {
  try {
    console.log('STARTING');

    const paymentsToUpdate = (await flexTransactionReportModel.find({
      'transaction.achTransactionCode': 27,
    })) as FlexTransactionReportDocument[];

    console.log('Updating loans: ', paymentsToUpdate.length);

    // const args = process.argv.slice();

    // console.log({ args });

    for (const payment of paymentsToUpdate) {
      const paymentManagement = await paymentmanagementModel.findOne({
        screenTracking: payment.screenTracking,
      });
      const { paymentSchedule } =
        paymentManagement as PaymentManagementDocument;

      const paymentScheduleItem = paymentSchedule.find((pm) => {
        const daysDiff = moment(pm.date).diff(
          new Date(payment.transaction.sendDate),
          'days',
        );

        return daysDiff >= -1 && daysDiff <= 1;
      });

      if (paymentScheduleItem) {
        console.log('Payment schedule item found: ', paymentScheduleItem);

        await Object.assign(payment, {
          paymentRef: paymentScheduleItem?.paymentReference,
        }).save();

        continue;
      }

      console.log('Payment schedule item not found!');
    }

    console.log('DONE');
    await closeDB();
  } catch (error) {
    console.log(error);
    return error;
  }
};
connectScreen();
