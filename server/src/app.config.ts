const NODE_ENV = process.env.NODE_ENV;
let baseUrl = 'http://localhost:8112';
let LOS_URL = 'http://localhost:1337';
const PREFIX_REFERENCE = 'P';

if (process.env.NODE_ENV === 'staging') {
  baseUrl = 'https://patria.alchemylms.com';
  LOS_URL = 'https://patria.alchemylms.com';
} else if (process.env.NODE_ENV === 'production') {
  baseUrl = 'https://lms.patrialending.com';
  LOS_URL = 'https://api.patrialending.com';
}
export default () => ({
  NODE_ENV: NODE_ENV || 'development',
  port: NODE_ENV !== 'production' ? 8112 : 8000,
  baseUrl,
  LOS_URL,
  PREFIX_REFERENCE,
});
