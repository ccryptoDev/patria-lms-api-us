import fs from 'fs-extra';
import { parseAsync } from 'json2csv';
import MongoDb, { Db } from 'mongodb';
import path from 'path';

const MongoClient = MongoDb.MongoClient;
const gradeWeightAmounts = {
  A: {
    downPayment: 0,
    weightAmts: {
      0: 7000,
      1: 6000,
      2: 6000,
      3: 5000,
      4: 4000,
      5: 2000,
    },
  },
  B: {
    downPayment: 0,
    weightAmts: {
      0: 7000,
      1: 6000,
      2: 5000,
      3: 4000,
      4: 3500,
      5: 2000,
    },
  },
  C: {
    downPayment: 0,
    weightAmts: {
      0: 6000,
      1: 5500,
      2: 4500,
      3: 4000,
      4: 3000,
      5: 2000,
    },
  },
  D: {
    downPayment: 0,
    weightAmts: {
      0: 5000,
      1: 4500,
      2: 4000,
      3: 3500,
      4: 3000,
      5: 2000,
    },
  },
  E: {
    downPayment: 0,
    weightAmts: {
      0: 3500,
      1: 3500,
      2: 3000,
      3: 3000,
      4: 2500,
      5: 2000,
    },
  },
  F: {
    downPayment: 0,
    weightAmts: {
      0: 3500,
      1: 3000,
      2: 3000,
      3: 2500,
      4: 2500,
      5: 2000,
    },
  },
  G: {
    downPayment: 0,
    weightAmts: {
      0: 3000,
      1: 3000,
      2: 2500,
      3: 2500,
      4: 2000,
      5: 2000,
    },
  },
  H: {
    downPayment: 300,
    weightAmts: {
      0: 2000,
      1: 2000,
      2: 2000,
      3: 2000,
      4: 2000,
      5: 2000,
    },
  },
  I: {
    downPayment: 300,
    weightAmts: {
      0: 2000,
      1: 2000,
      2: 2000,
      3: 2000,
      4: 2000,
      5: 2000,
    },
  },
};
const ficoDTIs = {
  '-999_579': {
    '0_10': 'I',
    '10_20': 'I',
    '20_30': 'I',
    '30_40': 'I',
    '40_50': 'I',
    '50_60': 'I',
    '60_100': 'I',
  },
  '580_599': {
    '0_10': 'H',
    '10_20': 'H',
    '20_30': 'H',
    '30_40': 'H',
    '40_50': 'I',
    '50_60': 'I',
    '60_100': 'I',
  },
  '600_619': {
    '0_10': 'H',
    '10_20': 'H',
    '20_30': 'H',
    '30_40': 'H',
    '40_50': 'H',
    '50_60': 'I',
    '60_100': 'I',
  },
  '620_639': {
    '0_10': 'F',
    '10_20': 'G',
    '20_30': 'G',
    '30_40': 'G',
    '40_50': 'H',
    '50_60': 'I',
    '60_100': 'I',
  },
  '640_659': {
    '0_10': 'F',
    '10_20': 'F',
    '20_30': 'G',
    '30_40': 'G',
    '40_50': 'G',
    '50_60': 'H',
    '60_100': 'I',
  },
  '660_669': {
    '0_10': 'E',
    '10_20': 'F',
    '20_30': 'F',
    '30_40': 'G',
    '40_50': 'G',
    '50_60': 'H',
    '60_100': 'I',
  },
  '670_679': {
    '0_10': 'E',
    '10_20': 'E',
    '20_30': 'F',
    '30_40': 'F',
    '40_50': 'G',
    '50_60': 'G',
    '60_100': 'I',
  },
  '680_689': {
    '0_10': 'D',
    '10_20': 'E',
    '20_30': 'E',
    '30_40': 'F',
    '40_50': 'F',
    '50_60': 'G',
    '60_100': 'I',
  },
  '690_699': {
    '0_10': 'D',
    '10_20': 'D',
    '20_30': 'E',
    '30_40': 'E',
    '40_50': 'F',
    '50_60': 'F',
    '60_100': 'I',
  },
  '700_709': {
    '0_10': 'C',
    '10_20': 'D',
    '20_30': 'D',
    '30_40': 'E',
    '40_50': 'D',
    '50_60': 'F',
    '60_100': 'I',
  },
  '710_719': {
    '0_10': 'C',
    '10_20': 'C',
    '20_30': 'D',
    '30_40': 'D',
    '40_50': 'E',
    '50_60': 'E',
    '60_100': 'I',
  },
  '720_729': {
    '0_10': 'B',
    '10_20': 'C',
    '20_30': 'C',
    '30_40': 'D',
    '40_50': 'D',
    '50_60': 'E',
    '60_100': 'I',
  },
  '730_739': {
    '0_10': 'B',
    '10_20': 'B',
    '20_30': 'C',
    '30_40': 'C',
    '40_50': 'D',
    '50_60': 'D',
    '60_100': 'I',
  },
  '740_759': {
    '0_10': 'B',
    '10_20': 'B',
    '20_30': 'B',
    '30_40': 'C',
    '40_50': 'C',
    '50_60': 'D',
    '60_100': 'I',
  },
  '760_779': {
    '0_10': 'A',
    '10_20': 'A',
    '20_30': 'B',
    '30_40': 'B',
    '40_50': 'B',
    '50_60': 'C',
    '60_100': 'I',
  },
  '780_814': {
    '0_10': 'A',
    '10_20': 'A',
    '20_30': 'A',
    '30_40': 'A',
    '40_50': 'A',
    '50_60': 'B',
    '60_100': 'I',
  },
  '815_850': {
    '0_10': 'A',
    '10_20': 'A',
    '20_30': 'A',
    '30_40': 'A',
    '40_50': 'A',
    '50_60': 'A',
    '60_100': 'I',
  },
};
const stateInterests = {
  CA: 24.99,
  TX: 24.99,
  NY: 24.99,
  NV: 24.99,
  AZ: 24.99,
  FL: 24.99,
  IL: 24.99,
};
const termGradeWeightAvls = {
  24: {
    A: 5,
    B: 5,
    C: 5,
    D: 5,
    E: 5,
    F: 5,
    G: 5,
    H: 5,
    I: 5,
  },
  36: {
    A: 4,
    B: 4,
    C: 3,
    D: 3,
    E: 2,
    F: 2,
    G: 0,
    H: 0,
    I: 0,
  },
  48: {
    A: 3,
    B: 3,
    C: 3,
    D: 3,
    E: 1,
    F: 0,
    G: 0,
    H: 0,
    I: 0,
  },
};

function generatePricingMatrixData() {
  const rates = [];
  const minLoanAmount = 500;
  Object.keys(stateInterests).forEach((state) => {
    const stateRate = stateInterests[state];
    Object.keys(termGradeWeightAvls).forEach((term) => {
      Object.keys(ficoDTIs).forEach((ficoRange) => {
        const ficoArr = ficoRange.split('_');
        const ficoMin = ficoArr[0];
        const ficoMax = ficoArr[1];
        Object.keys(ficoDTIs[ficoRange]).forEach((dtiRange) => {
          const dtiArr = dtiRange.split('_');
          const dtiMin = dtiArr[0];
          const dtiMax = dtiArr[1];
          const grade = ficoDTIs[ficoRange][dtiRange];
          const termGradeWeightAvl = termGradeWeightAvls[term][grade];
          const gradeWeightAmt = gradeWeightAmounts[grade];
          Object.keys(gradeWeightAmt.weightAmts).forEach((weight) => {
            const maxLoanAmount = gradeWeightAmt.weightAmts[weight];
            if (termGradeWeightAvl) {
              rates.push({
                state,
                term: parseInt(term),
                promoTerm: parseInt(term) / 2,
                ficoMin: parseInt(ficoMin),
                ficoMax: parseInt(ficoMax),
                dtiMin: parseInt(dtiMin),
                dtiMax: parseInt(dtiMax),
                grade,
                minLoanAmount,
                maxLoanAmount,
                adjWeightMax: parseInt(weight),
                downPayment: gradeWeightAmt.downPayment,
                interestRate: stateRate,
                promoInterestRate: 0,
              });
            }
          });
        });
      });
    });
  });
  return rates;
}

async function generateCsv() {
  let data = generatePricingMatrixData();
  data = data.map((record) => {
    return {
      state: record.state,
      term: record.term,
      promo_term: record.term / 2,
      fico_min: record.ficoMin,
      fico_max: record.ficoMax,
      dti_min: record.dtiMin,
      dti_max: record.dtiMax,
      grade: record.grade,
      min_loan_amount: record.minLoanAmt,
      max_loan_amount: record.maxLoanAmt,
      adj_weight_max: record.adjWeightMax,
      down_payment: record.downPayment,
      interest_rate: record.interestRate,
      promo_interest_rate: 0,
    };
  });

  const csvData = await parseAsync(data, { fields: Object.keys(data[0]) });
  const fileName = 'state-pricing_20201001.csv';
  const filePath = path.join(__dirname, fileName);
  fs.outputFileSync(filePath, csvData);
}

async function getStateList(db: Db) {
  let stateList = await db.collection('state').find().toArray();
  stateList = stateList.reduce((acc, state) => {
    acc[state.stateCode] = state._id.toString();
    return acc;
  }, {});
  return stateList;
}

async function populateDb() {
  console.log('connecting to db');
  const dbClient = await MongoClient.connect('mongodb://localhost:27017', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = dbClient.db('patria');
  const stateList = await getStateList(db);

  let data = generatePricingMatrixData();
  data = data.map((record) => {
    record.stateCode = record.state;
    record.state = stateList[record.stateCode];
    record.createdAt = new Date();
    record.updatedAt = new Date();
    return record;
  });

  /** delete old loan interest rates **/
  console.log('deleting old loan_interest_rate');
  const deleteResult = await db.collection('loan_interest_rate').deleteMany({});
  console.log('loan_interest_rate delete results:', {
    result: deleteResult.result,
  });

  /** create new loan interest rates **/
  console.log('inserting new loan_interest_rate records');
  const insertResult = await db
    .collection('loan_interest_rate')
    .insertMany(data);
  console.log('loan_interest_rate insert result', {
    length: data.length,
    count: insertResult.insertedCount,
  });
  console.log('closing db connection');
  await dbClient.close();
}

// generatePricingMatrixData();
// generateCsv();
populateDb();
