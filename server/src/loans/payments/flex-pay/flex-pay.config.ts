const isProd = process.env.NODE_ENV === 'production';

const COMPANY_CODE = isProd ? '007B' : '005H';
const FLEX_BASE_URL = `https://api${!isProd ? '-dev' : ''}.flx-payments.com`;

const FLEX_PAY_CONFIGS = {
  FLEX_TOKEN_URL: `${FLEX_BASE_URL}/api/v3/Tokenization/companycode/${COMPANY_CODE}`,
  FLEX_ACH_URL: `${FLEX_BASE_URL}/api/v3/AchTransactions/companycode/${COMPANY_CODE}`,
  FLEX_INSTANT_TRANSACTION: `${FLEX_BASE_URL}/api/v3/InstantTransactions/companycode/${COMPANY_CODE}`,
  FLEX_GET_ACH_STATUS: `${FLEX_BASE_URL}/api/v3/AchTransactions/companycode/${COMPANY_CODE}`,
  ACCESS_TOKEN_URL: `https://auth${
    !isProd ? '-dev' : ''
  }.flx-payments.com/connect/token`,
  grant_type: 'password',
  flex_username: `${COMPANY_CODE}@flexpaymentsolutions.com`,
  flex_password: 'Kzw=9PKGfYu*ps}z',
  flex_client_id: 'integration',
  flex_client_secret: 'F1ex&%8910$#Int3gr8',
};

if (isProd) {
  FLEX_PAY_CONFIGS.flex_password = '&xB7t4+EHXk$F$S6';
}

export default () => ({ ...FLEX_PAY_CONFIGS });
