import mongodb from 'mongodb';
import { EmploymentHistory } from 'src/user/employment-history/employment-history.schema';
import { ScreenTrackingDocument } from 'src/user/screen-tracking/screen-tracking.schema';
import { UserDocument } from 'src/user/user.schema';

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

    const screenTrackingList = await db
      .collection('screentracking')
      .find<ScreenTrackingDocument>({ origin: 'LEAD' })
      .toArray();

    console.log('screenTrackingList.length', screenTrackingList.length);

    for (const screenTracking of screenTrackingList) {
      try {
        const user = await db.collection('user').findOne<UserDocument>({
          _id: screenTracking.user,
          phones: { $exists: false },
        });

        console.log({ user: user?._id });

        if (user?._id) {
          const employmentData = await db
            .collection('employmenthistory')
            .findOne<EmploymentHistory>({ user: user._id });

          await db.collection('user').updateOne(
            { _id: screenTracking.user },
            {
              $set: {
                phones: [
                  {
                    phone: user.phoneNumber,
                    type: 'Residence',
                  },
                  {
                    phone: user.phoneNumber,
                    type: 'Cell',
                  },
                  {
                    phone: employmentData?.employerPhone,
                    type: 'Work',
                  },
                ],
              },
            },
          );
          // await Object.assign(user, {}).save();
          console.log('Phones added successfully.');
        }
      } catch (e) {
        console.log('error: %s', e.message);
      }
    }

    // const promises = screenTrackingList.map(async (screenTracking) => {});

    // let cursor = 0;
    // const chunkSize = 20;
    // const chunks: Array<Promise<void>[]> = new Array(
    //   Math.floor(promises.length / chunkSize),
    // ).fill([]);

    // chunks.forEach((chunk) => {
    //   const chunkPromises = promises.slice(cursor, cursor + chunkSize);
    //   cursor += chunkSize;
    //   chunk.push(chunkPromises as any);
    // }, []);

    // await new Promise(async (resolve) => {
    //   for (const chunk of chunks) {
    //     await Promise.all(chunk);
    //   }

    //   resolve(null);
    // }).then(async () => {
    await clientRef.close();
    console.log('Connection closed.');
    process.exit(0);
    // });

    // for (const screenTracking of screentrackingList) {
    // }
    // await db.collection('counters').deleteMany({});
    // console.log('Adding counters to database...');
    // await db.collection('counters').insertMany(counters);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();
