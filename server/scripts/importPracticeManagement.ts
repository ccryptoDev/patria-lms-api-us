import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

const practice = {
  _id: new ObjectID('6005a3908f9a2514b88da575'),
  status: 'active',
  isDeleted: false,
  regionalManager: 'Amanda Gainy',
  region: 'Arizona',
  managementRegion: 'AZ/NV',
  phone: '6028925006',
  location: 'Chandler',
  address: '3305 W Chandler Blvd Suite 4',
  city: 'Chandler',
  stateCode: 'AZ',
  zip: 85226,
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

    console.log('Adding first practice to practice_management collection.');
    await db.collection('practice_management').insertOne(practice);
    console.log('Practice saved');

    await clientRef.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();
