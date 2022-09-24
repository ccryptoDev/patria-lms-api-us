import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Mail from 'nodemailer/lib/mailer';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MandrillService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) { }

  async sendEmail(
    from: string,
    to: string,
    subject: string,
    html: string,
    requestId: string,
  ) {
    this.logger.log(
      'Sending email with params: ',
      `${MandrillService.name}#sendEmail`,
      requestId,
      { from, to, subject },
    );
    const mailer: Mail = this.configService.get<Mail>('mandrill');
    const mailOptions = {
      from,
      to,
      subject,
      html,
    };

    return new Promise((resolve, reject) => {
      mailer.sendMail(mailOptions, (error, info) => {
        if (error) {
          this.logger.error(
            'Error:',
            `${MandrillService.name}#sendEmail`,
            requestId,
            error,
          );
          reject(error);
        }
        this.logger.log(
          'Email sent.',
          `${MandrillService.name}#sendEmail`,
          requestId,
          info,
        );
        resolve(info);
      });
    });
  }
}
