import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const setting = [
  {
    maintenance: 1,
    isMaintenance: false,
    whitelistIp: '111.93.237.186',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    denomination: [{ label: '$20', value: 20 }],
    referenceId: 'H1tZh7Lwl',
    isDeleted: false,
    communityBankBalance: 99970750,
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

    await db.collection('setting').deleteMany({});
    console.log('Adding settings to database...');
    await db.collection('setting').insertMany(setting);
    console.log('Settings added successfully.');

    await clientRef.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();
