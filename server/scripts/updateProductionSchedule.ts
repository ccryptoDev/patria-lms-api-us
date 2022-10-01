import moment from 'moment';
import mongodb from 'mongodb';
import { PaymentManagementDocument } from 'src/loans/payments/payment-management/payment-management.schema';
import { EmploymentHistory } from 'src/user/employment-history/employment-history.schema';
import { ScreenTrackingDocument } from 'src/user/screen-tracking/screen-tracking.schema';
import { UserDocument } from 'src/user/user.schema';

const getFirstPaymentDate = (loanStartDate: Date): Date => {
  const dayINeed = 5; // for Friday
  const today = moment(loanStartDate).isoWeekday();

  // if we haven't yet passed the day of the week that I need:
  if (today < 2) {
    // then just give me this week's instance of that day
    return moment(loanStartDate).isoWeekday(dayINeed).startOf('day').toDate();
  } else {
    // otherwise, give me *next week's* instance of that same day
    return moment(loanStartDate)
      .add(1, 'weeks')
      .isoWeekday(dayINeed)
      .startOf('day')
      .toDate();
  }
};

const MongoClient = mongodb.MongoClient;

(async () => {
  try {
    const dbURL = 'mongodb://localhost:27017';
    const client = await MongoClient.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to ${dbURL}`);

    const clientRef = client;
    const db = client.db('patria');

    const loanList = await db
      .collection('paymentmanagement')
      .find<PaymentManagementDocument>({
        status: { $in: ['in-repayment prime', 'in-repayment'] },
      })
      .toArray();

    console.log('paymentmanagement.length', loanList.length);

    try {
      for (const loan of loanList) {
        const screenTracking = await db
          .collection('screentracking')
          .findOne<ScreenTrackingDocument>({
            _id: loan.screenTracking,
          });

        const selectedOffer = screenTracking.selectedOffer;
        console.log(loan.loanStartDate);
        console.log(selectedOffer.term);
        const newMaturityDate = moment(getFirstPaymentDate(loan.loanStartDate))
          .startOf('day')
          .add(Math.floor(selectedOffer.term * 4.34524) - 1, 'weeks')
          .toDate();
        console.log(newMaturityDate);
        await db.collection('paymentmanagement').updateOne(
          { _id: loan._id },
          {
            $set: {
              maturityDate: newMaturityDate,
            },
          },
        );
        console.log('Maturity date updated successfully.');
      }
    } catch (e) {
      console.log('error: %s', e.message);
    }

    await clientRef.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();
