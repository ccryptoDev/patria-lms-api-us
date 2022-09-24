import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const ObjectID = mongodb.ObjectID;

const admin = {
  _id: new ObjectID('595e364adc388abed9b64788'),
  userName: 'Alchemy Admin',
  email: 'dev@trustalchemy.com',
  password: '$2a$09$MZCDGozi2iUiqS7TtwJOs.GN.RcNyDgaOydi6tS4NXBCDKNIO78I6', // #Password1
  phoneNumber: '8053805270',
  role: new ObjectID('595e2dabdc388abed9b68742'),
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

    console.log('Adding first admin to admin collection.');
    await db.collection('admin_user').insertOne(admin);
    console.log('Admin saved');

    await clientRef.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();

// import mongodb from 'mongodb';
// import bcrypt from 'bcrypt';

// const MongoClient = mongodb.MongoClient;
// const ObjectID = mongodb.ObjectID;

// const user = {
//   _id: new ObjectID('607834c14e9f771e3aac5205'),
// };

// const updateQuery = {
//   password: '$2a$09$MZCDGozi2iUiqS7TtwJOs.GN.RcNyDgaOydi6tS4NXBCDKNIO78I6',
// };

// (async () => {
//   try {
//     const dbURL = 'mongodb://localhost:27017';
//     const client = await MongoClient.connect(dbURL, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log(`Connected to ${dbURL}`);
//     const clientRef = client;
//     const db = client.db('patria');

//     console.log('Adding first admin to admin collection.');
//     const newPassword = await bcrypt.hash('Admin123@', 10);
//     console.log('Adding first admin to admin collection. \n\n' + newPassword);
//     const newvalues = {
//       $set: {
//         password: newPassword,
//         role: new ObjectID('60c6468773a3450f40029c2a'),
//       },
//     };

//     //await db.collection('user').updateOne(admin);

//     //await db.collection('user').updateOne(user, newvalues);

//     console.log('Admin saved');

//     await clientRef.close();
//     console.log('Connection closed.');
//     process.exit(0);
//   } catch (error) {
//     console.log('Could not execute script. Error: ', error);
//     process.exit(0);
//   }
// })();
