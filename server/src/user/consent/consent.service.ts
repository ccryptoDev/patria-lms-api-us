import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import moment from 'moment';
import fs from 'fs';
import { promisify } from 'util';
import { ManagedUpload } from 'aws-sdk/clients/s3';

import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../screen-tracking/screen-tracking.schema';
import { User, UserDocument } from '../user.schema';
import { UserConsent, UserConsentDocument } from './consent.schema';
import {
  Agreement,
  AgreementDocument,
} from '../../loans/agreement/agreement.schema';
import { LoggerService } from '../../logger/logger.service';
import { S3Service } from '../../s3/s3.service';
import { PuppeteerService } from '../../puppeteer/puppeteer.service';
import {
  PaymentManagement,
  PaymentManagementDocument,
} from '../../loans/payments/payment-management/payment-management.schema';
import { AppService } from '../../app.service';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { AdminJwtPayload } from '../auth/types/jwt-payload.types';
import { GenerateEFTADto } from '../application/validation/generateEFTA.dto';
import {
  Esignature,
  EsignatureDocument,
} from '../esignature/esignature.schema';
import {
  LoanPaymentProCardToken,
  LoanPaymentProCardTokenDocument,
} from '../../loans/payments/loanpaymentpro/schemas/loanpaymentpro-card-token.schema';

@Injectable()
export class ConsentService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(LoanPaymentProCardToken.name)
    private readonly loanPaymentProCardTokenModel: Model<LoanPaymentProCardTokenDocument>,
    @InjectModel(UserConsent.name)
    private readonly userConsentModel: Model<UserConsentDocument>,
    @InjectModel(Esignature.name)
    private readonly esignatureModel: Model<EsignatureDocument>,
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    @InjectModel(Agreement.name)
    private readonly agreementModel: Model<AgreementDocument>,
    @InjectModel(PaymentManagement.name)
    private readonly paymentManagementModel: Model<PaymentManagementDocument>,
    private readonly puppeteerService: PuppeteerService,
    private readonly NunjucksService: NunjucksCompilerService,
    private readonly s3Service: S3Service,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  async createConsent(
    agreement: AgreementDocument,
    user: UserDocument,
    ip: string,
    screenTrackingId: string,
    requestId: string,
    paymentManagementId?: string,
  ) {
    this.logger.log(
      'Creating consent with params:',
      `${ConsentService.name}#createConsent`,
      requestId,
      { agreement, user, ip, screenTrackingId, paymentManagementId },
    );
    const userConsent = {
      documentName: agreement.documentName,
      documentVersion: agreement.documentVersion,
      documentKey: agreement.documentKey,
      ip: ip,
      phoneNumber: user.phones[0],
      signedAt: new Date(),
      user: user,
      screenTracking: screenTrackingId,
      paymentManagement: undefined,
      agreement: agreement,
      loanUpdated: 1,
    };
    if (paymentManagementId) {
      userConsent.paymentManagement = paymentManagementId;
    } else {
      const paymentManagement: PaymentManagementDocument | null =
        await this.paymentManagementModel.findOne({
          user,
          screenTracking: screenTrackingId,
        });
      if (paymentManagement) {
        userConsent.paymentManagement = paymentManagement._id;
      }
    }
    const newConsent = await this.userConsentModel.create(userConsent as any);
    this.logger.log(
      'Consent created',
      `${ConsentService.name}#createConsent`,
      requestId,
    );

    return newConsent;
  }

  async createConsents(screenTrackingId: string, request: Request) {
    const ip = (
      (request.headers['x-forwarded-for'] as string) ||
      (request.headers['x-real-ip'] as string) ||
      request.connection.remoteAddress
    )
      .replace('::ffff:', '')
      .replace(/^::1$/, '127.0.0.1');
    this.logger.log(
      'Creating consents with params:',
      `${ConsentService.name}#createConsents`,
      request.id,
      {
        screenTrackingId,
        ip,
      },
    );

    const screenTracking = await this.screenTrackingModel
      .findOne({
        _id: screenTrackingId,
      })
      .populate('user');
    if (!screenTracking)
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `screen tracking record not found with screenId: ${screenTrackingId}`,
          request.id,
        ),
      );
    if (!screenTracking.user)
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `user record not found for screen tracking record with screenId: ${screenTrackingId}`,
          request.id,
        ),
      );
    const user: UserDocument = screenTracking.user as UserDocument;
    const consentPromises = [];
    ['120', '126'].forEach((documentKey) => {
      consentPromises.push(
        (async () => {
          const agreement: AgreementDocument =
            await this.agreementModel.findOne({
              documentKey,
            });
          if (!agreement)
            throw new NotFoundException(
              this.appService.errorHandler(
                404,
                `could not find agreement for documentKey: ${documentKey} and practiceId: ${user.practiceManagement}`,
                request.id,
              ),
            );

          const userConsentDetails: UserConsentDocument =
            await this.createConsentForDocuments(
              agreement,
              user,
              ip,
              screenTrackingId,
              request.id,
            );
          if (!userConsentDetails)
            throw new InternalServerErrorException(
              this.appService.errorHandler(
                500,
                `could not create consent for documents with documentKey: ${documentKey} and practiceId: ${user.practiceManagement}`,
                request.id,
              ),
            );

          const agreementsPath =
            documentKey === '120'
              ? 'agreements/esignature.html'
              : 'agreements/sms-policy.html';
          const createResp: UserConsentDocument =
            await this.createStaticAgreementsPdf(
              userConsentDetails._id,
              userConsentDetails,
              screenTracking.applicationReference,
              agreementsPath,
              ip,
              request.id,
            );
          if (!createResp)
            throw new InternalServerErrorException(
              this.appService.errorHandler(
                500,
                `could not create static agreement pdf with documentKey: ${documentKey} and practiceId: ${user.practiceManagement}`,
                request.id,
              ),
            );

          return {
            agreement,
            userConsentDetails,
            createResp,
          };
        })(),
      );
    });

    const consents: any[] = await Promise.all(consentPromises);
    this.logger.log(
      `Created consents:`,
      `${ConsentService.name}#createConsents`,
      request.id,
      consents,
    );
    return consents;
  }

  /**
   *
   * @param agreement Agreement id
   * @param user User id
   * @param ip request ip
   * @param screenTrackingId Screen tracking id
   * @param requestId Unique request id
   * @param create Flag to create a new agreement or not
   */
  async createConsentForDocuments(
    agreement: AgreementDocument,
    user: UserDocument,
    ip: string,
    screenTrackingId: string,
    requestId: string,
    create?: boolean,
  ) {
    this.logger.log(
      'Creating user consent with params: ',
      `${ConsentService.name}#createConsentForDocuments`,
      requestId,
      { agreement, user, ip, screenId: screenTrackingId, create },
    );
    const consentCriteria = {
      user: user._id,
      screenId: screenTrackingId,
      documentKey: agreement.documentKey,
    };
    const consentData = await this.userConsentModel.findOne(consentCriteria);

    if (consentData && !create) {
      const now = new Date();
      consentData.signedAt = now;
      await consentData.save();
      this.logger.log(
        `Existing consent updated at:`,
        `${ConsentService.name}#createConsentForDocuments`,
        requestId,
        now,
      );

      return consentData;
    }

    const userConsent = {
      documentName: agreement.documentName,
      documentVersion: agreement.documentVersion,
      documentKey: agreement.documentKey,
      ip: ip,
      phoneNumber: user.phones[0],
      signedAt: new Date(),
      user: user,
      screenTracking: screenTrackingId,
      agreement,
      loanUpdated: 1,
    };
    const consent: UserConsentDocument = new this.userConsentModel(userConsent);
    await consent.save();
    this.logger.log(
      'User consent created.',
      `${ConsentService.name}#createConsentForDocuments`,
      requestId,
    );

    return consent;
  }

  async createStaticAgreementsPdf(
    consentId: string,
    userConsent: UserConsentDocument,
    applicationReference: string,
    agreementsPath: string,
    ip: string,
    requestId: string,
  ) {
    const html: string = await this.NunjucksService.htmlToString(
      agreementsPath,
      { ip, today: moment().format('MM/DD/YYYY') },
    );
    const userConsentDetails: UserConsentDocument = await this.userConsentModel
      .findOne({ _id: consentId })
      .populate('agreement')
      .populate('user');

    if (userConsent) {
      const userReference = (userConsentDetails.user as UserDocument)
        .userReference;
      const replacedFilename = (
        userConsentDetails.agreement as AgreementDocument
      ).documentName
        .split(' ')
        .join('_');
      const pdfFileName = `./${applicationReference}_${replacedFilename}_${Math.round(
        +new Date() / 1000,
      )}.pdf`;

      await this.puppeteerService.generatePDF(html, pdfFileName, requestId);
      await this.uploadTermsPdf(
        pdfFileName,
        userConsentDetails,
        applicationReference,
        userReference,
        requestId,
      );
      return userConsentDetails;
    }
  }

  async uploadRICPdf(
    ricData: any,
    agreement: AgreementDocument,
    request: Request,
  ) {
    const { userData, screenTracking } = ricData;
    const fsUnlinkPromise = promisify(fs.unlink);
    const pdfFileLocalPath = `./${
      ricData.screenTracking.applicationReference
    }_${agreement.documentName}_${Math.round(+new Date() / 1000)}.pdf`;
    const html = await this.NunjucksService.htmlToString(
      'agreements/ric.html',
      ricData,
    );
    await this.puppeteerService.generatePDF(html, pdfFileLocalPath, request.id);

    const fileName = this.getOriginalNameFromUrl(pdfFileLocalPath);
    const s3Folder = 'Agreements';
    const s3SubFolder = `${userData.userReference}/${screenTracking.applicationReference}`;
    const s3Path = `${s3Folder}/${s3SubFolder}/${fileName}`;
    const response: ManagedUpload.SendData = await this.s3Service.uploadFile(
      s3Path,
      fs.readFileSync(pdfFileLocalPath),
      'application/pdf',
      request.id,
    );

    await fsUnlinkPromise(pdfFileLocalPath);
    const s3DocumentsPath = this.s3Service.getS3Url(
      response.Location.split('/').slice(3).join('/'),
    );

    return s3DocumentsPath;
  }

  async uploadTermsPdf(
    pdfFileLocalPath: string,
    userConsentData: UserConsentDocument,
    applicationReference: string,
    userReference: string,
    requestId: string,
  ): Promise<string> {
    this.logger.log(
      `Uploading user consent to S3 with params:`,
      `${S3Service.name}#uploadTermsPdf`,
      requestId,
      {
        pdfFileLocalPath,
        userConsentData,
        applicationReference,
        userReference,
      },
    );
    const fsUnlinkPromise = promisify(fs.unlink);
    const fileName = this.getOriginalNameFromUrl(pdfFileLocalPath);
    const s3Folder = 'Agreements';
    const s3SubFolder = userReference + '/' + applicationReference;
    const s3Path = s3Folder + '/' + s3SubFolder + '/' + fileName;
    const response: ManagedUpload.SendData = await this.s3Service.uploadFile(
      s3Path,
      fs.readFileSync(pdfFileLocalPath),
      'application/pdf',
      requestId,
    );
    this.logger.log(
      'User consent uploaded to S3',
      `${S3Service.name}#uploadTermsPdf`,
      requestId,
    );
    await fsUnlinkPromise(pdfFileLocalPath);
    if (userConsentData) {
      userConsentData.agreementDocumentPath = this.s3Service.getS3Url(s3Path);
      await userConsentData.save();
    }

    return response.Location;
  }

  async uploadPromissoryAgreementAsset(
    filePath: string,
    userConsentDocument: UserConsentDocument,
    screenTrackingId: string,
    requestId: string,
  ) {
    const fileName = this.getOriginalNameFromUrl(filePath);
    const s3Folder = 'Agreements';
    const screenTracking = await this.screenTrackingModel
      .findOne({
        _id: screenTrackingId,
      })
      .populate('user');
    if (!screenTracking) {
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Screen tracking not found.',
          requestId,
        ),
      );
    }

    const applicationReference = screenTracking.applicationReference;
    const userReference = (screenTracking.user as UserDocument).userReference;
    const s3Path =
      `${s3Folder}/${userReference}/${applicationReference}/${fileName}`.replace(
        /\s/g,
        '_',
      );
    const response: ManagedUpload.SendData = await this.s3Service.uploadFile(
      s3Path,
      fs.readFileSync(filePath),
      'application/pdf',
      requestId,
    );
    if (userConsentDocument) {
      userConsentDocument.screenTracking = screenTracking._id;
      userConsentDocument.agreementDocumentPath =
        this.s3Service.getS3Url(s3Path);
      await userConsentDocument.save();
    }

    return response.Location;
  }

  async createEFTAAgreement(
    userId: string,
    generateEFTADto: GenerateEFTADto,
    request: Request,
  ) {
    let errorMessage = '';
    const user: UserDocument | null = await this.userModel
      .findById(userId)
      .populate('screenTracking');
    if (!user) {
      errorMessage = `User id ${userId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }
    if (!user.screenTracking) {
      errorMessage = `Screen tracking for user id ${userId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }
    const paymentManagement = await this.paymentManagementModel.findOne({
      user: user._id,
    });
    if (!paymentManagement) {
      errorMessage = `Payment management for user id ${userId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }

    const agreement: AgreementDocument | null =
      await this.agreementModel.findOne({ documentKey: '132' });
    if (!agreement) {
      errorMessage = `Agreement not found for documentKey "132"`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }

    const ip = this.appService.getIPAddress(request);
    const todayDate = moment().startOf('day').format('MM/DD/YYYY');
    const loanStartDate = moment(paymentManagement.loanStartDate).format(
      'MM/DD/YYYY',
    );
    const context = {
      ...generateEFTADto,
      ip,
      todayDate,
      loanStartDate,
      resign: false,
    };
    const screenTracking = user.screenTracking as ScreenTrackingDocument;
    const fsUnlinkPromise = promisify(fs.unlink);
    const pdfFileLocalPath = `./${screenTracking.applicationReference}_${
      agreement.documentName
    }_${Math.round(+new Date() / 1000)}.pdf`;
    const html = await this.NunjucksService.htmlToString(
      'agreements/efta.html',
      context,
    );
    await this.puppeteerService.generatePDF(html, pdfFileLocalPath, request.id);
    const fileName = this.getOriginalNameFromUrl(pdfFileLocalPath);
    const s3Folder = 'Agreements';
    const s3SubFolder = `${user.userReference}/${screenTracking.applicationReference}`;
    const s3Path = `${s3Folder}/${s3SubFolder}/${fileName}`;
    const response: ManagedUpload.SendData = await this.s3Service.uploadFile(
      s3Path,
      fs.readFileSync(pdfFileLocalPath),
      'application/pdf',
      request.id,
    );
    await fsUnlinkPromise(pdfFileLocalPath);
    const s3DocumentsPath = this.s3Service.getS3Url(
      response.Location.split('/').slice(3).join('/'),
    );

    const EFTADocument: UserConsentDocument =
      await this.userConsentModel.create({
        loanUpdated: 1,
        agreement,
        agreementDocumentPath: s3DocumentsPath,
        documentName: agreement.documentName,
        documentVersion: agreement.documentVersion,
        documentKey: agreement.documentKey,
        ip,
        signedAt: new Date(),
        user: user._id,
        screenTracking: screenTracking._id,
        paymentManagement: paymentManagement._id,
      });

    return EFTADocument._id;
  }

  async resignEFTA(
    screenTrackingId: string,
    cardToken: string,
    request: Request,
  ) {
    let errorMessage = '';
    const screenTracking: ScreenTrackingDocument | null =
      await this.screenTrackingModel.findById(screenTrackingId);
    if (!screenTracking) {
      errorMessage = `ScreenTracking id ${screenTrackingId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#resignEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }
    if (!screenTracking.user) {
      errorMessage = `User for screentracking id ${screenTrackingId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }
    const userInfo: UserDocument | null = await this.userModel.findById(
      screenTracking.user,
    );
    let ricSignature: string | undefined;
    const esignature: EsignatureDocument | null =
      await this.esignatureModel.findOne({ user: screenTracking.user });
    if (esignature) {
      const signature = await this.s3Service.downloadFile(
        esignature.signaturePath,
        request.id,
      );
      ricSignature = `data:${
        signature.ContentType
      };base64,${signature.Body.toString('base64')}`;
    }
    const cardInfo: LoanPaymentProCardTokenDocument | null =
      await this.loanPaymentProCardTokenModel.findOne({
        user: screenTracking.user,
        paymentMethodToken: cardToken,
      });
    if (!cardInfo) {
      errorMessage = `Card for user id ${screenTracking.user} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#resignEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }
    const generateEFTADto = {
      resign: true,
      signature: ricSignature,
      applicationReference: screenTracking.applicationReference,
      cardCode: cardInfo.cardCode,
      cardHolder: cardInfo.billingFirstName + ' ' + cardInfo.billingLastName,
      cardIssuer: '****',
      cardNumber: '************' + cardInfo.cardNumberLastFour,
      city: cardInfo.billingCity,
      expirationMonth: cardInfo.expMonth,
      expirationYear: cardInfo.expYear,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      phoneNumber: userInfo.phones[0].phone,
      selectedOffer: screenTracking.offerData,
      selectedState: cardInfo.billingState,
      street: userInfo.street,
      zipCode: cardInfo.billingZip,
    };
    const paymentManagement = await this.paymentManagementModel.findOne({
      screenTracking: screenTrackingId,
    });
    if (!paymentManagement) {
      errorMessage = `Payment management for screentracking id ${screenTrackingId} not found`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#resignEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }

    const agreement: AgreementDocument | null =
      await this.agreementModel.findOne({ documentKey: '132' });
    if (!agreement) {
      errorMessage = `Agreement not found for documentKey "132"`;

      this.logger.error(
        errorMessage,
        `${ConsentService.name}#createEFTAAgreement`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, request.id),
      );
    }

    const ip = this.appService.getIPAddress(request);
    const todayDate = moment().startOf('day').format('MM/DD/YYYY');
    const loanStartDate = moment(paymentManagement.loanStartDate).format(
      'MM/DD/YYYY',
    );
    const context = { ...generateEFTADto, ip, todayDate, loanStartDate };
    const user = screenTracking.user as UserDocument;
    const fsUnlinkPromise = promisify(fs.unlink);
    const pdfFileLocalPath = `./${screenTracking.applicationReference}_${
      agreement.documentName
    }_${Math.round(+new Date() / 1000)}.pdf`;
    const html = await this.NunjucksService.htmlToString(
      'agreements/efta.html',
      context,
    );
    await this.puppeteerService.generatePDF(html, pdfFileLocalPath, request.id);
    const fileName = this.getOriginalNameFromUrl(pdfFileLocalPath);
    const s3Folder = 'Agreements';
    const s3SubFolder = `${userInfo.userReference}/${screenTracking.applicationReference}`;
    const s3Path = `${s3Folder}/${s3SubFolder}/${fileName}`;
    const response: ManagedUpload.SendData = await this.s3Service.uploadFile(
      s3Path,
      fs.readFileSync(pdfFileLocalPath),
      'application/pdf',
      request.id,
    );
    await fsUnlinkPromise(pdfFileLocalPath);
    const s3DocumentsPath = this.s3Service.getS3Url(
      response.Location.split('/').slice(3).join('/'),
    );

    const EFTADocument: UserConsentDocument =
      await this.userConsentModel.create({
        loanUpdated: 1,
        agreement,
        agreementDocumentPath: s3DocumentsPath,
        documentName: agreement.documentName,
        documentVersion: agreement.documentVersion,
        documentKey: agreement.documentKey,
        ip,
        signedAt: new Date(),
        user: user._id,
        screenTracking: screenTracking._id,
        paymentManagement: paymentManagement._id,
      });

    return EFTADocument._id;
  }

  async getUserConsents(
    screenTrackingId: string,
    admin: AdminJwtPayload,
    requestId: string,
  ) {
    this.logger.log(
      'Getting user consents with params:',
      `${ConsentService.name}#getUserConsents`,
      requestId,
      { screenTrackingId, admin },
    );

    const screenTrackingDocument: ScreenTrackingDocument | null =
      await this.screenTrackingModel
        .findOne({
          _id: screenTrackingId,
        })
        .populate('user');
    if (!screenTrackingDocument) {
      const errorMessage = `Could not find screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${ConsentService.name}#getUserConsents`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }
    if (!screenTrackingDocument.user) {
      const errorMessage = `Could not find the user screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${ConsentService.name}#getUserConsents`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const userConsents: UserConsentDocument[] | null =
      await this.userConsentModel.find({
        screenTracking: screenTrackingDocument._id,
      });

    if (!userConsents || userConsents.length <= 0) {
      const errorMessage = `No consents found for screen tracking id ${screenTrackingDocument._id}`;
      this.logger.error(
        errorMessage,
        `${ConsentService.name}#getUserDocuments`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    this.logger.log(
      'Got user consents:',
      `${ConsentService.name}#getUserDocuments`,
      requestId,
      userConsents,
    );

    return userConsents;
  }

  getOriginalNameFromUrl(url: string): string {
    const urlArray: string[] = url.split('/');

    return urlArray[urlArray.length - 1];
  }
}
