import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';

import { AppService } from '../../../app.service';
import { ApplicationLink, ApplicationLinkDocument } from './link.schema';
import { CreateLinkDto } from './validation/createLink.dto';
import { GetLinkDto } from './validation/getLink.dto';
import {
  PracticeManagement,
  PracticeManagementDocument,
} from '../../../loans/practice-management/practice-management.schema';
import { LoggerService } from '../../../logger/logger.service';
import { MandrillService } from '../../../mandrill/mandrill.service';
import { TwilioService } from '../../../twilio/twilio.service';
import { NunjucksCompilerService } from '../../../nunjucks-compiler/nunjucks-compiler.service';

@Injectable()
export class ApplicationLinkService {
  constructor(
    @InjectModel(ApplicationLink.name)
    private readonly applicationLinkModel: Model<ApplicationLinkDocument>,
    @InjectModel(PracticeManagement.name)
    private readonly practiceManagementModel: Model<PracticeManagementDocument>,
    private readonly mandrillService: MandrillService,
    private readonly twilioService: TwilioService,
    private readonly NunjucksService: NunjucksCompilerService,
    private readonly configService: ConfigService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async createLinkRecord(
    createLinkDto: CreateLinkDto,
    requestId: string,
  ): Promise<{ applicationLinkUrl: string; id: string }> {
    const {
      firstName,
      practiceManagement,
      email,
      phone,
      sendEmail,
      sendSms,
    } = createLinkDto;
    this.logger.log(
      'Creating application link with params:',
      `${ApplicationLink.name}#createLinkRecord`,
      requestId,
      createLinkDto,
    );

    const practice: PracticeManagementDocument = await this.practiceManagementModel.findOne(
      {
        _id: practiceManagement,
      },
    );
    if (!practice) {
      this.logger.error(
        'Practice management not found',
        `${ApplicationLink.name}#createLinkRecord`,
        requestId,
        createLinkDto,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Practice management id '${practiceManagement}' not found`,
          requestId,
        ),
      );
    }

    const applicationLink = new this.applicationLinkModel(createLinkDto);
    await applicationLink.save();
    this.logger.log(
      'Application link created:',
      `${ApplicationLink.name}#createLinkRecord`,
      requestId,
      applicationLink,
    );

    const applicationLinkUrl = `${this.configService.get<string>(
      'baseUrl',
    )}/apply/${applicationLink._id}`;

    if (sendEmail) {
      const html = await this.NunjucksService.htmlToString(
        'emails/application-link.html',
        {
          link: applicationLinkUrl,
          firstName,
        },
      );
      const from = this.configService.get<string>('sendersEmail');
      const subject = this.configService.get<string>('emailSubject');
      await this.mandrillService.sendEmail(
        'no-reply@patrialending.com',
        email,
        subject,
        html,
        requestId,
      );
    }
    if (sendSms) {
      const smsMessage = this.configService.get<string>('smsTemplate');
      await this.twilioService.sendTextMessage(
        phone,
        `${smsMessage} ${applicationLinkUrl}`,
        requestId,
      );
    }

    this.logger.log(
      'Application link generated:',
      `${ApplicationLinkService.name}#createLinkRecord`,
      requestId,
      applicationLinkUrl,
    );

    return { applicationLinkUrl, id: applicationLink._id };
  }

  async getLinkRecord(getLinkDto: GetLinkDto, requestId: string) {
    this.logger.log(
      'Getting application link with params:',
      `${ApplicationLinkService.name}#getLinkRecord`,
      requestId,
      getLinkDto,
    );
    const { id } = getLinkDto;
    const applicationLink: ApplicationLinkDocument | null = await this.applicationLinkModel.findOne(
      {
        _id: id,
      },
    );
    if (!applicationLink) {
      this.logger.error(
        'Application link not found',
        `${ApplicationLinkService.name}#getLinkRecord`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Application link id ${id}`,
          requestId,
        ),
      );
    }

    this.logger.log(
      'Got application link:',
      `${ApplicationLinkService.name}#getLinkRecord`,
      requestId,
      applicationLink,
    );
    return applicationLink;
  }
}
