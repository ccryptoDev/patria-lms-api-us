import XLSX from 'xlsx';
import MongoDb from 'mongodb';
import path from 'path';
const MongoClient = MongoDb.MongoClient;
const host = 'localhost';
const port = 27017;
const database = 'patria';
const Const = (v) => (_) => v;
const Identity = (v) => v;
const NormalizePhoneNumber = (PhoneNumberString) => {
  const IsDigit = (c) => !Number.isNaN(Number.parseInt(c));

  const digitsFromNumber = PhoneNumberString.split('').filter(IsDigit);

  return digitsFromNumber.length === 10
    ? digitsFromNumber.join('')
    : '(invalid)' + digitsFromNumber.join('');
};
const mapper = (mapSpec) => (obj) => {
  const result: any = {};
  const now = new Date();

  for (const row of mapSpec) {
    const sourceProp = row[0];
    const sourceValue = sourceProp ? obj[sourceProp] : null;
    const mapperFn = row[1];
    const TargetProp = row[2];

    result[TargetProp] = mapperFn(sourceValue, obj);
  }

  result.createdAt = now;
  result.updatedAt = now;
  return result;
};

// Properties
const mapSpec = [
  [null, Const('active'), 'status'],
  [null, Const(false), 'isDeleted'],
  ['Regional Mgr', Identity, 'regionalManager'],
  ['Region', Identity, 'region'],
  ['Management Region', Identity, 'managementRegion'],
  ['Phone', NormalizePhoneNumber, 'phone'],
  ['Location', Identity, 'location'],
  ['Address', Identity, 'address'],
  ['City', Identity, 'city'],
  ['State', Identity, 'stateCode'],
  ['Zip', Identity, 'zip'],
  ['Open Date', Identity, 'openDate'],
];

const relativePathToSheet = '../LA_LocationGuide_2020.xlsx';
const absolutePathToFile = path.resolve(__dirname, relativePathToSheet);
let workbook: any;
try {
  workbook = XLSX.readFile(absolutePathToFile, { cellDates: true });
} catch (e) {
  console.log(`Couldn't find spreadsheet file at ${absolutePathToFile}`);
  process.exit(0);
}
const firstSheetName = workbook.SheetNames[0];
const FirstSheet = workbook.Sheets[firstSheetName];
const JsonRows = XLSX.utils.sheet_to_json(FirstSheet);
const Documents = JsonRows.map(mapper(mapSpec));

// Save into the database
MongoClient.connect(
  `mongodb://${host}/${port}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err, client) => {
    if (err !== null)
      throw new Error(
        `Could not connect to the mongo database at host:port - ${host}:${port}` +
          err.message,
      );

    console.log(`Connected successfully to the database: ${database}`);

    const db = client.db(database);
    const collection = db.collection('practice_management');
    const AmountOfDocuments = Documents.length;

    collection.insertMany(Documents, (err, resultObj) => {
      const amountOfOperations = resultObj.ops.length;

      if (AmountOfDocuments !== amountOfOperations) {
        console.warn(
          `Not all documents were added.\n` +
            `Successfully added: ${amountOfOperations}` +
            ` out of ${AmountOfDocuments}`,
        );
        process.exit(1);
      } else {
        console.log(
          `Successfully added ${AmountOfDocuments} documents to the database`,
        );
        process.exit(0);
      }
    });
  },
);
