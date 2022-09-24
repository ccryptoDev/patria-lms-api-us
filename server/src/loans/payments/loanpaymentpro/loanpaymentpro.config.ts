const NODE_ENV = process.env.NODE_ENV;
const acquiringKey =
  NODE_ENV === 'production'
    ? '3264e63d-e73e-4f36-a1fd-0c8cc3212ac8'
    : '2710bc20-55d9-437a-9b30-f62038e389bf';
//: 'd69b9ea6-fff3-45c3-8caf-1182478315e1';

export default () => ({
  v2BaseUrl: 'https://gateway.loanpaymentpro.com/v2',
  v21BaseUrl: 'https://gateway.loanpaymentpro.com/v2-1',
  acquiringKey,
});
