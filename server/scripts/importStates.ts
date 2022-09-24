import mongodb from 'mongodb';

const MongoClient = mongodb.MongoClient;
const codeState: [code: string, stateName: string][] = [
  ['KY', 'Kentucky'],
  ['FL', 'Florida'],
  ['CA', 'California'],
  ['TX', 'Texas'],
  ['AL', 'Alabama'],
  ['AK', 'Alaska'],
  ['AZ', 'Arizona'],
  ['AR', 'Arkansas'],
  ['CO', 'Colorado'],
  ['CT', 'Connecticut'],
  ['DE', 'Delaware'],
  ['DC', 'District of Columbia'],
  ['ME', 'Maine'],
  ['MT', 'Montana'],
  ['NE', 'Nebraska'],
  ['NV', 'Nevada'],
  ['NH', 'New Hampshire'],
  ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'],
  ['NY', 'New York'],
  ['NC', 'North Carolina'],
  ['ND', 'North Dakota'],
  ['OH', 'Ohio'],
  ['OK', 'Oklahoma'],
  ['OR', 'Oregon'],
  ['MD', 'Maryland'],
  ['MA', 'Massachusetts'],
  ['MI', 'Michigan'],
  ['MS', 'Mississippi'],
  ['MN', 'Minnesota'],
  ['MO', 'Missouri'],
  ['PA', 'Pennsylvania'],
  ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'],
  ['SD', 'South Dakota'],
  ['TN', 'Tennessee'],
  ['UT', 'Utah'],
  ['VT', 'Vermont'],
  ['VA', 'Virginia'],
  ['WA', 'Washington'],
  ['WV', 'West Virginia'],
  ['WI', 'Wisconsin'],
  ['WY', 'Wyoming'],
  ['HI', 'Hawaii'],
  ['IN', 'Indiana'],
  ['IA', 'Iowa'],
  ['KS', 'Kansas'],
  ['LA', 'Louisiana'],
  ['ID', 'Idaho'],
  ['IL', 'Illinois'],
  ['GA', 'Georgia'],
];
const states = codeState.map((cs) => {
  return {
    stateCode: cs[0],
    name: cs[1],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});
console.log('states to insert:');
console.log(states);

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

    console.log('Adding initial states to "state" collection.');
    await db.collection('state').deleteMany({});
    await db.collection('state').insertMany(states);
    console.log('States saved');

    await clientRef.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.log('Could not execute script. Error: ', error);
    process.exit(0);
  }
})();
