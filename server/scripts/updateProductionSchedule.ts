import mongoose, { Model } from 'mongoose';
import { ScreenTrackingSchema } from '../src/user/screen-tracking/screen-tracking.schema';
import { PaymentManagementSchema } from '../src/loans/payments/payment-management/payment-management.schema';
import { UserSchema } from '../src/user/user.schema';
import { IPaymentScheduleItem } from 'src/loans/payments/payment-management/payment-schedule-item.interface';
const connectDB = async () => {
  try {
    const uri = 'mongodb://localhost/patria';
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
  'ScreenTracking',
  ScreenTrackingSchema,
);
const paymentmanagementModel = mongoose.model(
  'Payment_Management',
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
    const user = await userModel.findOne({
      email: 'melissa.martinez1293@gmail.com', //melissa.martinez1293@gmail.com
    });
    if (user != null) {
      const findscreenTracking = await screenTrackingModel.find({
        _id: user['screenTracking'],
      });
      if (findscreenTracking != null) {
        const paymentManagement = await paymentmanagementModel.findOne({
          user: user['_id'],
        });
        if (paymentManagement != null) {
          const paymentScheduleItems: IPaymentScheduleItem[] =
            paymentManagement['paymentSchedule'];

          for (let index = 0; index <= paymentScheduleItems.length; index++) {
            // if (
            //   paymentScheduleItems[index] != undefined &&
            //   paymentScheduleItems[index].status === 'opened'
            // ) {
            //   let date = new Date();
            //   date = paymentScheduleItems[index].date;
            //   console.log('updatedPaymentManagement ++ ', date);
            //   // add a day
            //   date = new Date(date.setDate(date.getDate() - 0));
            //   paymentScheduleItems[index].date = date;
            //   console.log(
            //     'updatedPaymentManagement -- ',
            //     paymentScheduleItems[index].date,
            //   );

            //   const updatedPaymentManagement = {
            //     paymentSchedule: paymentScheduleItems,
            //   };

            //   //   console.log(
            //   //     'updatedPaymentManagement -- ',
            //   //     updatedPaymentManagement,
            //   //   );
            //   await paymentmanagementModel.updateOne(
            //     { user: user._id },
            //     updatedPaymentManagement,
            //   );
            // }
            if (
              paymentScheduleItems[index] != undefined &&
              paymentScheduleItems[index].status === 'paid'
            ) {
              let date = new Date(paymentScheduleItems[index].date);
              const months = date.getMonth();
              if (months === 11) {
                const myDate = new Date('01/02/2022');
                date = new Date(myDate);
                paymentScheduleItems[index].date = date;
                console.log(
                  'updatedPaymentManagement -- PAID',
                  paymentScheduleItems[index].date,
                );

                const updatedPaymentManagement = {
                  paymentSchedule: paymentScheduleItems,
                };

                await paymentmanagementModel.updateOne(
                  { user: user._id },
                  updatedPaymentManagement,
                );
              }
            }
          }

          // const paymentModel = await paymentmanagementModel.find({
          //   id: msg._id,
          // });
        }
      }
    }

    await closeDB();
  } catch (error) {
    console.log(error);
    return error;
  }
};
connectScreen();
