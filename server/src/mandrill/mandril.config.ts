import nodemailer from 'nodemailer';
import mandrillTransport = require('nodemailer-mandrill-transport');

export default () => ({
  mandrill: nodemailer.createTransport(
    mandrillTransport({
      auth: {
        apiKey: 'KiX_5vJyNMfITIf3yF6NvA',
        async: true,
      },
    }),
  ),
});
