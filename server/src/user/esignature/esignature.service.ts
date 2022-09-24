import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import crypto from 'crypto';
import { Model } from 'mongoose';
import { Request } from 'express';

import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../screen-tracking/screen-tracking.schema';
import { UserDocument } from '../user.schema';
import { Esignature, EsignatureDocument } from './esignature.schema';
import { SaveSignatureDto } from './validation/saveSignature.dto';
import { LoggerService } from '../../logger/logger.service';
import { UserConsent, UserConsentDocument } from '../consent/consent.schema';
import { S3Service } from '../../s3/s3.service';
import { AppService } from '../../app.service';

@Injectable()
export class EsignatureService {
  constructor(
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    @InjectModel(Esignature.name)
    private readonly esignatureModel: Model<EsignatureDocument>,
    @InjectModel(UserConsent.name)
    private readonly userConsentModel: Model<UserConsentDocument>,
    private readonly s3Service: S3Service,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) { }

  async saveSignature(saveSignatureDto: SaveSignatureDto, request: Request) {
    this.logger.log(
      'Saving signature with params:',
      `${EsignatureService.name}#saveSignature`,
      request.id,
      saveSignatureDto,
    );
    const { screenTrackingId, hiddenSignatureId, imgBase64 } = saveSignatureDto;
    const ip = this.appService.getIPAddress(request);
    const userAgent = request.headers['user-agent'];
    const screenTracking: ScreenTrackingDocument | null =
      await this.screenTrackingModel
        .findOne({
          _id: screenTrackingId,
        })
        .populate('user');
    if (!screenTracking) {
      this.logger.error(
        'Screen tracking not found',
        `${EsignatureService.name}#saveSignature`,
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
    const existingEsignature: EsignatureDocument | null =
      await this.esignatureModel.findOne({
        screenTracking: screenTracking._id,
      });
    if (existingEsignature) {
      this.logger.error(
        'Esignature already exists',
        `${EsignatureService.name}#saveSignature`,
        request.id,
      );
      throw new ForbiddenException(
        this.appService.errorHandler(
          403,
          'Signature already saved',
          request.id,
        ),
      );
    }
    if (!screenTracking.user) {
      this.logger.error(
        'User for this screen tracking not found',
        `${EsignatureService.name}#saveSignature`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          `User for screen tracking id ${screenTrackingId} not found`,
          request.id,
        ),
      );
    }

    const user: UserDocument = screenTracking.user as UserDocument;
    const userConsent: UserConsentDocument | null =
      await this.userConsentModel.findOne({ user: user._id });
    if (!userConsent) {
      this.logger.error(
        'Consent not found',
        `${EsignatureService.name}#saveSignature`,
        request.id,
      );
      throw new NotFoundException(
        this.appService.errorHandler(
          404,
          'Consent for this user not found',
          request.id,
        ),
      );
    }
    const seed: Buffer = crypto.randomBytes(20);
    const uniqueSHA1String = crypto
      .createHash('sha1')
      .update(seed)
      .digest('hex');
    const fileData: {
      fileExtension: string;
      buffer: Buffer;
    } = this.base64PngToBuffer(imgBase64, request.id);
    const fileName = `image-${uniqueSHA1String}`;
    if (!hiddenSignatureId) {
      const s3Path = `Esignature/${user.userReference}/${screenTracking.applicationReference}/${fileName}.${fileData.fileExtension}`;
      const signature = {
        consent: userConsent._id,
        device: userAgent,
        fullName: `${user.firstName} ${user.lastName}`,
        ipAddress: ip,
        screenTracking: screenTrackingId,
        signature: `${fileName}.${fileData.fileExtension}`,
        signaturePath: s3Path,
        user: user.id,
      };
      const esignature = new this.esignatureModel(signature);
      await esignature.save();

      await this.s3Service.uploadFile(
        s3Path,
        fileData.buffer,
        'image/png',
        request.id,
      );
      await this.screenTrackingModel.updateOne(
        { _id: screenTrackingId },
        { esignature, lastLevel: 'sign-contract' },
      );

      const response = {
        esignatureId: esignature.id,
      };
      this.logger.log(
        'Saved signature.',
        `${EsignatureService.name}#saveSignature`,
        request.id,
        response,
      );

      return response;
    } else {
      const updateParams = {
        fullName: `${user.firstName} ${user.lastName}`,
        ipAddress: ip,
        device: userAgent,
      };
      this.logger.log(
        'Updating existing signature with params:',
        `${EsignatureService.name}#saveSignature`,
        request.id,
        updateParams,
      );
      await this.esignatureModel.updateOne(
        { id: hiddenSignatureId },
        updateParams,
      );
      const response = {
        esignatureId: hiddenSignatureId,
      };
      this.logger.log(
        'Updated existing signature',
        `${EsignatureService.name}#saveSignature`,
        request.id,
        response,
      );

      return response;
    }
  }

  base64PngToBuffer(imageBase64: string, requestId: string) {
    const pngExtensionSignature = 'iVBORw0KGgo';
    if (!(imageBase64.indexOf(pngExtensionSignature) === 0)) {
      throw new BadRequestException(
        this.appService.errorHandler(
          400,
          'Only PNG files are supported',
          requestId,
        ),
      );
    }

    const response = {
      fileExtension: 'png',
      buffer: Buffer.from(imageBase64, 'base64'),
    };

    return response;
  }
}
