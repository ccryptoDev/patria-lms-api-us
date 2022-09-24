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
    const findscreenTracking = await screenTrackingModel.find({
      isCompleted: true,
    });
    //adjWeightMax
    console.log(findscreenTracking.length);
    for (const item of findscreenTracking) {
      const user = await userModel.findOne({
        screenTracking: item._id,
      });
      //console.log('user -- ', user);
      if (user != null) {
        const paymentManagement = await paymentmanagementModel.findOne({
          user: user._id,
          promoSelected: true,
          apr: 0,
        });
        //console.log('msg -- ', msg);
        if (paymentManagement != null) {
          // console.log(
          //   'Payments -- ',
          //   item._id,
          //   msg['paymentSchedule'][0],
          //   msg._id,
          // );
          const aprUpdate = await paymentmanagementModel.updateOne(
            { _id: paymentManagement._id },
            {
              apr: paymentManagement['interestApplied'],
            },
          );
          console.log('screenUpdate -- ', aprUpdate);
          if (aprUpdate.nModified != null) {
            const paymentScheduleItems: IPaymentScheduleItem[] = paymentManagement[
              'paymentSchedule'
            ].filter((scheduleItem) => scheduleItem.status === 'paid');

            for (let index = 0; index <= paymentScheduleItems.length; index++) {
              if (paymentScheduleItems[index] != undefined) {
                if (paymentScheduleItems[index]['interest'] == 0) {
                  console.log(
                    'xValue -- ',
                    paymentScheduleItems[index].startPrincipal,
                  );
                  paymentScheduleItems[index].interest = parseFloat(
                    (
                      (paymentScheduleItems[index].startPrincipal *
                        paymentManagement['apr']) /
                      100 /
                      12
                    ).toFixed(2),
                  );

                  paymentScheduleItems[index].principal = parseFloat(
                    (
                      paymentScheduleItems[index].amount -
                      paymentScheduleItems[index].interest
                    ).toFixed(2),
                  );

                  if (
                    paymentScheduleItems[index].principal >
                    paymentManagement['payOffAmount']
                  ) {
                    paymentScheduleItems[index].principal =
                      paymentManagement['payOffAmount'];
                    paymentScheduleItems[index].amount = parseFloat(
                      (
                        paymentScheduleItems[index].interest +
                        paymentScheduleItems[index].principal
                      ).toFixed(2),
                    );
                  }
                  if (index == 0) {
                    paymentManagement['payOffAmount'] =
                      paymentScheduleItems[index].startPrincipal;
                  } else {
                    paymentScheduleItems[index].startPrincipal =
                      paymentManagement['payOffAmount'];
                  }

                  paymentScheduleItems[index].endPrincipal = parseFloat(
                    (
                      paymentScheduleItems[index].startPrincipal -
                      paymentScheduleItems[index].principal
                    ).toFixed(2),
                  );

                  paymentManagement['payOffAmount'] = parseFloat(
                    (
                      paymentScheduleItems[index].startPrincipal -
                      paymentScheduleItems[index].principal
                    ).toFixed(2),
                  );

                  paymentScheduleItems[index].paidInterest =
                    paymentScheduleItems[index].interest;

                  paymentScheduleItems[index].paidPrincipal =
                    paymentScheduleItems[index].principal;

                  const updatedPaymentManagement = {
                    paymentSchedule: paymentScheduleItems,
                    payOffAmount: paymentManagement['payOffAmount'],
                  };

                  console.log(
                    'updatedPaymentManagement -- ',
                    updatedPaymentManagement,
                  );
                  await paymentmanagementModel.updateOne(
                    { user: user._id },
                    updatedPaymentManagement,
                  );
                }
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
