import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;
const roles = [
  {
    _id: new ObjectID('595e2dabdc388abed9b68742'),
    roleName: 'Super Admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    roleName: 'Manager - LA',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    roleName: 'Agent',
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

    await db.collection('roles').deleteMany({});
    console.log('Adding Super Admin, User, and Manager roles to database...');
    await db.collection('roles').insertMany(roles);
    console.log('Roles added successfully.');

    await clientRef.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();
