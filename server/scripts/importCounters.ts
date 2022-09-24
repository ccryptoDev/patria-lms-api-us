import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const counters = [
  {
    apptype: 'user',
    sequence_value: '10000',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    apptype: 'logs',
    sequence_value: '10000',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    apptype: 'application',
    sequence_value: '10000',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    apptype: 'practiceuser',
    sequence_value: '10000',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    apptype: 'achcredit',
    sequence_value: '10000',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    apptype: 'achdebit',
    sequence_value: '1000',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    apptype: 'payment',
    sequence_value: '0',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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

    await db.collection('counters').deleteMany({});
    console.log('Adding counters to database...');
    await db.collection('counters').insertMany(counters);
    console.log('Counters added successfully.');

    await clientRef.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();
