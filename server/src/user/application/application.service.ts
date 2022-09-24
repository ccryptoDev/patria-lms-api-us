import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import moment from 'moment';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError } from 'aws-sdk';
import s3 from 'aws-sdk/clients/s3';

import {
  PaymentManagement,
  PaymentManagementDocument,
} from '../../loans/payments/payment-management/payment-management.schema';
import { PaymentManagementService } from '../../loans/payments/payment-management/payment-management.service';
import { LoggerService } from '../../logger/logger.service';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../screen-tracking/screen-tracking.schema';
import { User, UserDocument } from '../user.schema';
import { PracticeManagementDocument } from '../../loans/practice-management/practice-management.schema';
import {
  Agreement,
  AgreementDocument,
} from '../../loans/agreement/agreement.schema';
import { UserConsent, UserConsentDocument } from '../consent/consent.schema';
import {
  Esignature,
  EsignatureDocument,
} from '../esignature/esignature.schema';
import { ConsentService } from '../consent/consent.service';
import { S3Service } from '../../s3/s3.service';
import { AppService } from '../../app.service';
//@/user-application/authentication/api'
import { MandrillService } from '../../mandrill/mandrill.service';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class ApplicationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Esignature.name)
    private readonly esignatureModel: Model<EsignatureDocument>,
    @InjectModel(UserConsent.name)
    private readonly userConsentModel: Model<UserConsentDocument>,
    @InjectModel(PaymentManagement.name)
    private readonly paymentManagementModel: Model<PaymentManagementDocument>,
    @InjectModel(Agreement.name)
    private readonly agreementModel: Model<AgreementDocument>,
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    private readonly paymentManagementService: PaymentManagementService,
    private readonly userConsentService: ConsentService,
    private readonly s3Service: S3Service,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly mailService: MandrillService,
    private readonly nunjucksService: NunjucksCompilerService,
    private readonly configService: ConfigService,
  ) { }

  async createLoan(
    screenTrackingId: string,
    userId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Creating loan with params:',
      `${ApplicationService.name}#createLoan`,
      requestId,
      { screenTrackingId, userId },
    );
    const user: UserDocument | null = await this.userModel.findOne({
      _id: userId,
    });
    if (!user) {
      this.logger.error(
        'User not found',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, 'User not found.', requestId),
      );
    }
    const screenTracking: ScreenTrackingDocument | null =
      await this.screenTrackingModel
        .findOne({
          _id: screenTrackingId,
          isCompleted: false,
          user: userId,
        })
        .sort('createdAt DESC');
    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found or application is already complete',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          `User screen tracking not found or application is already complete.`,
          requestId,
        ),
      );
    }
    if (!screenTracking.offerData) {
      this.logger.error(
        'No offers found for this screen tracking',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          'No offers found for this screen tracking',
          requestId,
        ),
      );
    }
    const existingLoan: PaymentManagementDocument | null =
      await this.paymentManagementModel.findOne({
        screenTracking: screenTracking._id,
        status: { $nin: ['expired', 'approved', 'pending'] },
      });
    if (existingLoan) {
      this.logger.error(
        'User already has an existing loan',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          'User already has an existing loan',
          requestId,
        ),
      );
    }

    const paymentDetails: any =
      await this.paymentManagementService.createLoanPaymentSchedule(
        screenTracking,
        requestId,
      );
    if (!paymentDetails) {
      this.logger.error(
        'Error creating loan payment schedule.',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new InternalServerErrorException(
        this.appService.errorHandler(
          500,
          'Error creating loan payment schedule.',
          requestId,
        ),
      );
    }

    const updatedUserScreenTracking =
      await this.screenTrackingModel.findByIdAndUpdate(
        screenTracking.id,
        {
          lastLevel: 'repayment',
        },
        { new: true },
      );

    if (
      !(
        updatedUserScreenTracking.lastLevel === 'repayment' ||
        updatedUserScreenTracking.lastLevel === 'document-upload'
      )
    ) {
      this.logger.error(
        'Error creating loan payment schedule.',
        `${ApplicationService.name}#createLoan`,
        requestId,
      );
      throw new InternalServerErrorException(
        this.appService.errorHandler(
          500,
          'User screen tracking not updated.',
          requestId,
        ),
      );
    }

    await this.userModel.findByIdAndUpdate(userId, {
      isExistingLoan: true,
    });

    this.welcomeEmail(user, screenTracking, paymentDetails);
  }

  async initLoanSchedule(
    screenTrackingId: string,
    userId: string,
    requestId: string,
  ) {
    try {
      // const user: UserDocument | null = await this.userModel.findOne({
      //   _id: userId,
      // });
      const screenTracking: ScreenTrackingDocument | null =
        await this.screenTrackingModel
          .findOne({
            _id: screenTrackingId,
            isCompleted: false,
            user: userId,
          })
          .sort('createdAt DESC');

      if (!screenTracking.selectedOffer) {
        this.logger.error(
          'No offers found for this screen tracking',
          `${ApplicationService.name}#createLoan`,
          requestId,
        );
        throw new ForbiddenException(
          this.appService.errorHandler(
            403,
            'No offers found for this screen tracking',
            requestId,
          ),
        );
      }

      const paymentDetails: any =
        await this.paymentManagementService.createLoanPaymentSchedule(
          screenTracking,
          requestId,
        );

      return paymentDetails;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationService.name}#initLoanSchedule`,
        '',
        error,
      );
      throw error;
    }
  }

  async welcomeEmail(
    user: User,
    sTracking: ScreenTracking,
    payment: PaymentManagementDocument,
  ) {
    try {
      const baseUrl = this.configService.get<string>('baseUrl');
      const html = await this.nunjucksService.htmlToString(
        'emails/application-welcome.html',
        {
          userName: `${user.firstName} ${user.lastName}`,
          dateCreated: moment(user.createdAt).format('MM/DD/YYYY'),
          payOff: `$${sTracking.offerData.loanAmount}`,
          financingTerm: sTracking.offerData.term,
          payoffTerm: sTracking.offerData.promoTerm,
          minAmt: `$${sTracking.offerData.monthlyPayment}`,
          payOffPromo: `$${parseFloat(
            (
              sTracking.offerData.loanAmount / sTracking.offerData.promoTerm
            ).toFixed(2),
          )}`,
          link: `${baseUrl}/login`,
        },
      );
      const subject = 'Welcome Email';
      const from = 'no-reply@patrialending.com';
      const to = user.email;

      await this.mailService.sendEmail(from, to, subject, html, '');

      this.logger.log(
        'Response status 204',
        `${ApplicationService.name}#updateCustomerDetails`,
        '',
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationService.name}#updateCustomerDetails`,
        '',
        error,
      );
      throw error;
    }
  }

  async generateRIC(
    screenTrackingId: string,
    userId: string,
    request: Request,
  ) {
    const ip: string = this.appService.getIPAddress(request);
    this.logger.log(
      'Generating RIC with params:',
      `${ApplicationService.name}#generateRIC`,
      request.id,
      { screenTrackingId, userId, ip },
    );
    const screenTracking: ScreenTrackingDocument | null =
      await this.screenTrackingModel
        .findOne({
          _id: screenTrackingId,
          user: userId,
        })
        .populate('user')
        .populate('practiceManagement');
    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found',
        `${ApplicationService.name}#generateRIC`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Screen tracking not found.',
          request.id,
        ),
      );
    }

    const paymentManagement: PaymentManagementDocument | null =
      await this.paymentManagementModel.findOne({
        screenTracking: screenTrackingId,
        user: userId,
      });
    if (!paymentManagement) {
      this.logger.error(
        'Payment management not found',
        `${ApplicationService.name}#generateRIC`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Payment management not found.',
          request.id,
        ),
      );
    }

    const agreement: AgreementDocument | null =
      await this.agreementModel.findOne({
        documentKey: '131',
      });
    if (!agreement) {
      this.logger.error(
        'Agreement not found',
        `${ApplicationService.name}#generateRIC`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, 'Agreement not found.', request.id),
      );
    }

    const ricData = await this.getPromissoryNoteData2(
      screenTracking._id,
      request,
    );
    const signature: EsignatureDocument | null =
      await this.esignatureModel.findOne({
        user: userId,
      });
    if (!signature) {
      this.logger.error(
        'Esignature not found',
        `${ApplicationService.name}#uploadRICPdf`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Esignature not found for user id ${userId}`,
          request.id,
        ),
      );
    }

    const signatureImage: PromiseResult<s3.GetObjectOutput, AWSError> =
      await this.s3Service.downloadFile(signature.signaturePath, request.id);
    const agreementDocumentPath = await this.userConsentService.uploadRICPdf(
      {
        ...ricData,
        signature: `data:image/png;base64,${signatureImage.Body.toString(
          'base64',
        )}`,
      },
      agreement,
      request,
    );

    /**
     * remove any previously created user consents
     * for ric (documentKey: 131)
     **/
    await this.userConsentModel.deleteOne({
      documentKey: '131',
      user: userId,
    });

    /** create user consent for RIC **/
    const userConsent = {
      agreementDocumentPath,
      documentName: agreement.documentName,
      documentVersion: agreement.documentVersion,
      documentKey: agreement.documentKey,
      ip: ip,
      signedAt: new Date(),
      user: screenTracking.user as UserDocument,
      agreement: agreement,
      loanUpdated: 1,
      screenTracking: screenTracking._id,
      paymentManagement: paymentManagement._id,
    };
    const newUserConsent = await this.userConsentModel.create(
      userConsent as any,
    );

    /** update e-signature with screen tracking id **/
    await this.esignatureModel.updateOne(
      {
        user_id: (screenTracking.user as UserDocument)._id,
      },
      {
        consent: newUserConsent._id,
        screenTracking: screenTracking._id,
      },
    );
  }

  async getPromissoryNoteData2(screenTrackingId: string, request: Request) {
    this.logger.log(
      'Getting promissory note data 2 with params:',
      `${ApplicationService.name}#getPromissoryNoteData2`,
      request.id,
      { screenTrackingId },
    );
    const screenTracking: ScreenTrackingDocument | null =
      await this.screenTrackingModel
        .findOne({
          _id: screenTrackingId,
        })
        .populate('user')
        .populate('practiceManagement');
    if (!screenTracking) {
      this.logger.error(
        'Screen tracking id not found',
        `${ApplicationService.name}#getPromissoryNoteData2`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `Screen tracking id ${screenTrackingId} not found`,
          request.id,
        ),
      );
    }
    if (!screenTracking.user) {
      this.logger.error(
        'User for this screen tracking not found',
        `${ApplicationService.name}#getPromissoryNoteData2`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'User for this screen tracking not found.',
          request.id,
        ),
      );
    }

    const user: UserDocument = screenTracking.user as UserDocument;
    const practiceManagement: PracticeManagementDocument =
      screenTracking.practiceManagement as PracticeManagementDocument;
    const selectedOffer = screenTracking.offerData;
    if (!selectedOffer) {
      this.logger.error(
        'Screen tracking does not have a selected offer',
        `${ApplicationService.name}#getPromissoryNoteData2`,
        request.id,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          `Screen tracking id ${screenTrackingId} does not have a selected offer`,
          request.id,
        ),
      );
    }

    const ricAgreement: AgreementDocument | null =
      await this.agreementModel.findOne({
        documentKey: '131',
      });
    if (!ricAgreement) {
      this.logger.error(
        'RIC agreement not found',
        `${ApplicationService.name}#getPromissoryNoteData2`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `RIC agreement not found for practice id ${practiceManagement._id}`,
          request.id,
        ),
      );
    }

    const ricSignature: EsignatureDocument = await this.esignatureModel.findOne(
      {
        user: user._id,
      },
    );
    if (ricSignature) {
      ricSignature.signaturePath = this.s3Service.getS3Url(
        ricSignature.signaturePath,
      );
    }

    const paymentSchedule: any[] =
      this.paymentManagementService.getLoanPaymentSchedule(
        screenTracking,
        true,
        request.id,
      );
    const response = {
      screenTracking: {
        applicationReference: screenTracking.applicationReference,
        approveUpTo: screenTracking.approvedUpTo,
      },
      paymentScheduleInfo: {
        lastPayment: {
          amount: paymentSchedule[paymentSchedule.length - 1].amount,
          due: moment(paymentSchedule[paymentSchedule.length - 1].date).format(
            'MM/DD/YYYY',
          ),
          numberOfPayments: 1,
        },
        regularPayments: {
          amount: paymentSchedule[0].amount,
          due: `${moment(paymentSchedule[0].date).format('Do')} of each month`,
          numberOfPayments: paymentSchedule.length,
        },
        totalPayments: {
          amount: paymentSchedule[0].amount,
          due: moment(paymentSchedule[0].date).format('MM/DD/YYYY'),
          numberOfPayments: paymentSchedule.length,
        },
      },
      provider: {
        practiceName: practiceManagement.location,
        streetAddress: practiceManagement.address,
        city: practiceManagement.city,
        stateCode: practiceManagement.stateCode,
        zipCode: practiceManagement.zip,
        phone: practiceManagement.phone,
      },
      selectedOffer: {
        ...selectedOffer,
        documentaryStampTax: 0,
        firstPaymentDate: moment().add(30, 'days').format('MM/DD/YYYY'),
        fundingDate: moment().format('MM/DD/YYYY'),
        paymentFrequency: 'monthly',
        salesTax: 0,
      },
      ricSignaturePath: ricSignature?.signaturePath,
      userData: {
        userReference: user.userReference,
        fullName: `${user.firstName} ${user.lastName}`,
        street: user.street,
        city: user.city,
        state: user.state,
        zipCode: user.zipCode,
        ip: this.appService.getIPAddress(request),
        phoneNumber: user.phones[0].phone || '',
      },
      date: moment().format('MM/DD/YYYY'),
    };

    return response;
  }

  async connectUserConsentsToPM(
    screenTrackingId: string,
    userId: string,
    requestId: string,
  ) {
    this.logger.log(
      'Connecting user consents to PM with params:',
      `${ApplicationService.name}#connectUserConsentsToPM`,
      requestId,
      { screenTrackingId, userId },
    );

    const screenTracking = await this.screenTrackingModel
      .findOne({
        _id: screenTrackingId,
        user: userId,
      })
      .populate('user')
      .populate('practiceManagement');
    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found',
        `${ApplicationService.name}#connectUserConsentsToPM`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Screen tracking not found',
          requestId,
        ),
      );
    }

    const paymentManagement: PaymentManagementDocument | null =
      await this.paymentManagementModel.findOne({
        screenTracking: screenTrackingId,
        user: userId,
      });
    if (!paymentManagement) {
      this.logger.error(
        'Payment management not found',
        `${ApplicationService.name}#connectUserConsentsToPM`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Payment management not found.',
          requestId,
        ),
      );
    }

    const userConsents: UserConsentDocument[] =
      await this.userConsentModel.find({
        paymentManagement: { $exists: false },
        screenTracking: screenTrackingId,
        user: userId,
      });

    if (userConsents.length) {
      await this.userConsentModel.updateOne(
        {
          screenTracking: screenTrackingId,
          user: userId,
        },
        { paymentManagement: paymentManagement._id },
      );
      //welcomeEmail('');
    }
  }

  async setupAutoPayLater(screenTrackingId: string, requestId: string) {
    const screenTracking = await this.screenTrackingModel.findById(
      screenTrackingId,
    );
    if (!screenTracking) {
      const errorMessage = `Screen tracking id ${screenTrackingId} not found`;
      this.logger.error(errorMessage, ApplicationService.name, requestId);

      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    if (screenTracking.lastLevel === 'repayment') {
      await this.screenTrackingModel.updateOne(
        { _id: screenTracking._id },
        { lastLevel: 'document-upload' },
      );
    }
  }

  async createTestSchedule(testOffer: any) {
    try {
      const paymentDetails: any =
        await this.paymentManagementService.testAmortization(testOffer);

      return paymentDetails;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationService.name}#initLoanSchedule`,
        '',
        error,
      );
      throw error;
    }
  }
}
