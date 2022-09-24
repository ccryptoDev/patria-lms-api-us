import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

const practice = {
  _id: new ObjectID('607834c14e9f771e3aac5203'),
  lateFee: 10,
  nsfFee: 25,
  lateFeeGracePeriod: 15,
  delinquencyPeriod: 90,
  isDeleted: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

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

    console.log('Adding loan settings to loan_settings collection.');
    await db.collection('loan_settings').insertOne(practice);
    console.log('Loan Settings saved');

    await clientRef.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();
