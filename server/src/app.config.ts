const NODE_ENV = process.env.NODE_ENV;
let baseUrl = 'http://localhost:8112';
let LOS_URL = 'http://localhost:1337';
let VUE_APP_URL = 'http://localhost:8080';
const PREFIX_REFERENCE = 'P';

if (process.env.NODE_ENV === 'staging') {
  baseUrl = 'https://patria.alchemylms.com';
  LOS_URL = 'https://patria.alchemylms.com';
  VUE_APP_URL = 'https://patria-lms-ui.alchemylms.com';
} else if (process.env.NODE_ENV === 'production') {
  baseUrl = 'https://lms-api.patrialending.com';
  LOS_URL = 'https://api.patrialending.com';
  VUE_APP_URL = 'https://lms.patrialending.com';
}
export default () => ({
  NODE_ENV: NODE_ENV || 'development',
  port: NODE_ENV !== 'production' ? 8112 : 8000,
  baseUrl,
  LOS_URL,
  PREFIX_REFERENCE,
  VUE_APP_URL,
});
