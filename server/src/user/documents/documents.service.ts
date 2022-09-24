import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { Model } from 'mongoose';

import { AppService } from '../../app.service';
import { LoggerService } from '../../logger/logger.service';
import { S3Service } from '../../s3/s3.service';
import { User, UserDocument } from '../user.schema';
import { UserDocuments, UserDocumentsDocument } from './documents.schema';
import UploadDocDto from './validation/uploadDoc.dto';
import {
  AdminJwtPayload,
  UserJwtPayload,
} from '../auth/types/jwt-payload.types';

@Injectable()
export class UserDocumentsService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(UserDocuments.name)
    private readonly userDocumentsModel: Model<UserDocumentsDocument>,
    private readonly s3Service: S3Service,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) { }

  async uploadDocument(
    uploadDocDto: UploadDocDto,
    requestId: string,
    uploaderPayload: AdminJwtPayload & UserJwtPayload,
    screenTrackingId?: string,
  ): Promise<{ documentId: string }> {
    const {
      documentType,
      driversLicenseBack,
      driversLicenseFront,
      passport,
      paystub,
      proofOfResidence,
      otherDoc,
      otherDocTitle,
    } = uploadDocDto;
    let { userId } = uploadDocDto;

    let user: UserDocument | null;
    if (screenTrackingId) {
      user = await this.userModel.findOne({
        screenTracking: screenTrackingId,
      });
    } else {
      user = await this.userModel.findOne({
        _id: userId,
      });
    }

    if (!user) {
      const errorMessage = screenTrackingId
        ? `User not found for screen tracking id ${screenTrackingId}`
        : `User id ${userId} not found`;
      this.logger.error(
        errorMessage,
        `${UserDocumentsService.name}#uploadDocument`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    if (screenTrackingId) {
      userId = user._id;
    }
    if (documentType === 'drivers license') {
      const driversLicenseFrontFormat: {
        extension: string;
        contentType: string;
      } = this.getBase64FileFormat(driversLicenseFront, requestId);
      const driversLicenseBackFormat: {
        extension: string;
        contentType: string;
      } = this.getBase64FileFormat(driversLicenseBack, requestId);
      const driversLicenseFrontBuffer = Buffer.from(
        driversLicenseFront,
        'base64',
      );
      const driversLicenseBackBuffer = Buffer.from(
        driversLicenseBack,
        'base64',
      );
      const s3Response: ManagedUpload.SendData[] = await Promise.all([
        this.s3Service.uploadFile(
          `UserDocuments/${userId}/DriversLicense/front.${driversLicenseFrontFormat.extension}`,
          driversLicenseFrontBuffer,
          driversLicenseFrontFormat.contentType,
          requestId,
        ),
        this.s3Service.uploadFile(
          `UserDocuments/${userId}/DriversLicense/back.${driversLicenseBackFormat.extension}`,
          driversLicenseBackBuffer,
          driversLicenseBackFormat.contentType,
          requestId,
        ),
      ]);
      const s3DocumentsPath: string[] = s3Response.map((document) =>
        document.Location.split('/').slice(3).join('/'),
      );
      const driversLicense = {
        front: this.s3Service.getS3Url(s3DocumentsPath[0]),
        back: this.s3Service.getS3Url(s3DocumentsPath[1]),
      };
      const userDocuments = new this.userDocumentsModel({
        driversLicense: driversLicense,
        user: userId,
        uploaderRole: uploaderPayload.role,
        uploaderName:
          uploaderPayload.role === 'User'
            ? `${uploaderPayload.firstName} ${uploaderPayload.lastName}`
            : uploaderPayload.userName,
        uploaderId: uploaderPayload.id,
      });
      await userDocuments.save();

      const response = { documentId: userDocuments._id as string };
      this.logger.log(
        "User's document uploaded",
        `${UserDocumentsService.name}#uploadDocument`,
        requestId,
        response,
      );
      console.log('Document uploaded');
      return response;
    }

    let uploadUrl = null;
    let uploadBuffer = null;
    let contentType = null;
    if (documentType === 'paystub') {
      const payStubFormat: {
        extension: string;
        contentType: string;
      } = this.getBase64FileFormat(paystub, requestId);
      uploadUrl = `UserDocuments/${userId}/paystub.${payStubFormat.extension}`;
      uploadBuffer = Buffer.from(paystub, 'base64');
      contentType = payStubFormat.contentType;
    }
    if (documentType === 'proofOfResidence') {
      const proofOfResidenceFormat: {
        extension: string;
        contentType: string;
      } = this.getBase64FileFormat(proofOfResidence, requestId);
      uploadUrl = `UserDocuments/${userId}/proofOfResidence.${proofOfResidenceFormat.extension}`;
      uploadBuffer = Buffer.from(proofOfResidence, 'base64');
      contentType = proofOfResidenceFormat.contentType;
    }
    if (documentType === 'passport') {
      const passportFormat: {
        extension: string;
        contentType: string;
      } = this.getBase64FileFormat(passport, requestId);
      uploadUrl = `UserDocuments/${userId}/passport.${passportFormat.extension}`;
      uploadBuffer = Buffer.from(passport, 'base64');
      contentType = passportFormat.contentType;
    }
    if (documentType === 'otherDoc') {
      const otherDocFormat: {
        extension: string;
        contentType: string;
      } = this.getBase64FileFormat(otherDoc, requestId);
      uploadUrl = `UserDocuments/${userId}/${otherDocTitle}.${otherDocFormat.extension}`;
      uploadBuffer = Buffer.from(otherDoc, 'base64');
      contentType = otherDocFormat.contentType;
    }
    // handle passport upload
    // const passportFormat: {
    //   extension: string;
    //   contentType: string;
    // } = this.getBase64FileFormat(passport, requestId);
    // const passportBuffer = Buffer.from(passport, 'base64');
    const s3Response = await this.s3Service.uploadFile(
      uploadUrl,
      uploadBuffer,
      contentType,
      requestId,
    );
    const context = {
      // passport: this.s3Service.getS3Url(
      //   s3Response.Location.split('/').slice(3).join('/'),
      // ),
      user: userId,
      uploaderRole: uploaderPayload.role,
      uploaderName:
        uploaderPayload?.firstName ?? uploaderPayload?.userName ?? 'no name',
      uploaderId: uploaderPayload.id,
      otherDocTitle: otherDocTitle || null,
    };

    context[documentType] = this.s3Service.getS3Url(
      s3Response.Location.split('/').slice(3).join('/'),
    );
    const userDocuments = new this.userDocumentsModel(context);
    await userDocuments.save();

    const response = { documentId: userDocuments._id as string };
    this.logger.log(
      "User's document uploaded",
      `${UserDocumentsService.name}#uploadDocument`,
      requestId,
      response,
    );

    return response;
  }

  async getUserDocuments(screenTrackingId: string, requestId: string) {
    this.logger.log(
      'Getting user documents with params:',
      `${UserDocumentsService.name}#getUserDocuments`,
      requestId,
      { screenTrackingId },
    );

    const user: UserDocument | null = await this.userModel.findOne({
      screenTracking: screenTrackingId,
    });
    if (!user) {
      const errorMessage = `Could not find user for screen tracking id ${screenTrackingId}`;
      this.logger.error(
        errorMessage,
        `${UserDocumentsService.name}#getUserDocuments`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const userDocuments: UserDocuments[] | null =
      await this.userDocumentsModel.find({
        user: user._id,
      });

    if (!userDocuments || userDocuments.length <= 0) {
      const errorMessage = `No documents found for user id ${user._id}`;
      this.logger.error(
        errorMessage,
        `${UserDocumentsService.name}#getUserDocuments`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    this.logger.log(
      'Got user documents:',
      `${UserDocumentsService.name}#getUserDocuments`,
      requestId,
      userDocuments,
    );

    return userDocuments;
  }

  getBase64FileFormat(
    imageBase64: string,
    requestId: string,
  ): { extension: string; contentType: string } {
    this.logger.log(
      'Getting file format for base64 string',
      `${UserDocumentsService.name}#getBase64FileFormat`,
      requestId,
    );
    const fileExtensionSignatures = {
      iVBORw0KGgo: { extension: 'png', contentType: 'image/png' },
      JVBERi0: { extension: 'pdf', contentType: 'application/pdf' },
      '/9j/': { extension: 'jpeg', contentType: 'image/jpeg' },
    };
    let isFormatSupported = false;

    const response: { extension: string; contentType: string } = {
      extension: '',
      contentType: '',
    };
    for (const extensionSignature in fileExtensionSignatures) {
      if (
        Object.prototype.hasOwnProperty.call(
          fileExtensionSignatures,
          extensionSignature,
        )
      ) {
        if (imageBase64.indexOf(extensionSignature) === 0) {
          response.extension =
            fileExtensionSignatures[extensionSignature].extension;
          response.contentType =
            fileExtensionSignatures[extensionSignature].contentType;
          isFormatSupported = true;

          break;
        }
      }
    }

    if (!isFormatSupported) {
      throw new BadRequestException(
        this.appService.errorHandler(
          400,
          'Only .png, .jpeg or .pdf files are supported',
          requestId,
        ),
      );
    }

    this.logger.log(
      'Base 64 file format:',
      `${UserDocumentsService.name}#getBase64FileFormat`,
      requestId,
      response,
    );

    return response;
  }
}
