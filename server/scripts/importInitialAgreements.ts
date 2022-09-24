import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;

const agreements = [
  {
    documentKey: '120',
    documentName: 'E-Signature',
    documentVersion: 1,
    active: true,
    documentPath: 'document/Electronic_Records_and_Signatures',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    documentKey: '126',
    documentName: 'SMS Policy',
    documentVersion: 1,
    active: true,
    documentPath: 'document/tcpa_v1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    documentKey: '131',
    documentName: 'Retail Installment Contract',
    documentVersion: 1,
    active: true,
    documentPath: 'document/loanAgreementAndPromissoryNote_v1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    documentKey: '132',
    documentName: 'Electronic Funds Transfer Authorization',
    documentVersion: 1,
    active: true,
    documentPath: 'document/E-Consent_v1',
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

    console.log('Adding initial agreements to agreement collection.');
    await db.collection('agreement').insertMany(agreements);
    console.log('Agreements saved');

    await clientRef.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();
