import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import passwordGenerator from 'generate-password';

import { User, UserDocument } from '../../user/user.schema';
import { LoggerService } from '../../logger/logger.service';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../user/screen-tracking/screen-tracking.schema';
import { RolesDocument } from '../roles/roles.schema';
import { Admin, AdminDocument } from '../admin/admin.schema';
import { AdminJwtPayload, UserJwtPayload } from './types/jwt-payload.types';
import { UserService } from '../user.service';
import { AppService } from '../../app.service';
import { AdminForgotPasswordDto } from './validation/admin-forgot-password.dto';
import { ConfigService } from '@nestjs/config';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { MandrillService } from '../../mandrill/mandrill.service';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../user/log-activity/log-activity.service';
import { parse } from 'json2csv';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    @InjectModel(Admin.name)
    private readonly adminModel: Model<AdminDocument>,
    private readonly jwtService: JwtService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly nunjucksService: NunjucksCompilerService,
    private readonly mailService: MandrillService,
    private readonly logActivityService: LogActivityService,
  ) {}

  async validateAdminUser(
    email: string,
    password: string,
  ): Promise<AdminDocument> {
    this.logger.log(
      'Validating credentials for admin user with email:',
      `${AuthService.name}#validateUser`,
      undefined,
      email,
    );
    const user: AdminDocument | null = await this.adminModel
      .findOne({ email: email })
      .populate('role');
    console.log('user roles===', user);
    if (!user) {
      this.logger.error(
        `User with email ${email} not found`,
        `${AuthService.name}#validateUser`,
      );
      return null;
    }

    const passwordMatch = await bcrypt.compare(password.trim(), user.password);

    if (!passwordMatch) {
      this.logger.error(
        `Password for admin user with email ${email} doesn't match`,
        `${AuthService.name}#validateUser`,
      );
      return null;
    }

    delete user.password;
    this.logger.log(
      'Credentials validated.',
      `${AuthService.name}#validateUser`,
      undefined,
      user,
    );
    return user;
  }

  async validateUser(email: string, password: string): Promise<UserDocument> {
    this.logger.log(
      'Validating credentials for user with email:',
      `${AuthService.name}#validateUser`,
      undefined,
      email,
    );
    const user: UserDocument = await this.userModel
      .findOne({
        email: {
          $regex: new RegExp(
            '^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$',
            'i',
          ),
        },
      })
      .populate('role');
    if (!user) {
      this.logger.error(
        `User with email ${email} not found`,
        `${AuthService.name}#validateUser`,
      );
      return null;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      this.logger.error(
        `Password for user with email ${email} doesn't match`,
        `${AuthService.name}#validateUser`,
      );
      return null;
    }

    delete user.password;
    this.logger.log(
      'Credentials validated.',
      `${AuthService.name}#validateUser`,
      undefined,
      user,
    );
    return user;
  }

  async generateJwt(user: UserDocument | AdminDocument, requestId: string) {
    this.logger.log(
      'Generating JWT token for user id:',
      `${AuthService.name}#generateJwt`,
      undefined,
      user._id,
    );

    // admin and practice admin login
    let payload: AdminJwtPayload | UserJwtPayload;
    if ('userName' in user) {
      user as AdminDocument;
      payload = {
        id: user._id,
        email: user.email,
        userName: user.userName,
        practiceManagement: user.practiceManagement as string,
        role: (user?.role as RolesDocument)?.roleName,
      };
    } else {
      // user login
      user as User;
      const screenTracking = await this.screenTrackingModel.findOne({
        user: user._id,
      });
      if (!screenTracking) {
        throw new UnauthorizedException();
      }

      if (
        screenTracking.lastLevel == 'offers' ||
        screenTracking.lastLevel == 'sign-contract' ||
        screenTracking.lastLevel == 'repayment' ||
        screenTracking.lastLevel == 'document-upload' ||
        screenTracking.isCompleted == false
      ) {
        // const ssnValidate = await this.userService.ssnValidatenext(
        //   user.ssnNumber,
        //   requestId,
        //   'Login',
        // );
      }

      payload = {
        user: {
          id: user._id,
          email: user.email,
        },
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        screenTracking: screenTracking._id,
        role: (user?.role as RolesDocument)?.roleName || 'User',
      };
    }

    const jwt: string = this.jwtService.sign(payload, {
      secret:
        process.env.TOKEN_SECRET ||
        '14495376e5f661f3d7c525cfedda17c07a548aff5559733810f7ceeba39a82137253adc9b017025b5c6d8cd7f30aa74611d0ae0895e25f67725291ac59927c67',
    });
    this.logger.log(
      `JWT token for user id ${user._id} generated`,
      `${AuthService.name}#generateJwt`,
      undefined,
      jwt,
    );

    const response: {
      id: string;
      email: string;
      role: string;
      token: string;
      userName?: string;
      practiceManagement?: string;
    } = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      token: jwt,
    };
    if ('userName' in payload) {
      response.userName = payload.userName;
    }
    if ('practiceManagement' in payload) {
      response.practiceManagement = payload.practiceManagement;
    }

    return response;
  }

  async generateCustomerUpdateToken(
    email: string,
    requestId: string,
  ): Promise<{ user: UserDocument; token: string }> {
    this.logger.log(
      'Generating a token to CustomerUpdateToken with params:',
      `${AuthService.name}#generateCustomerUpdateToken`,
      requestId,
      email,
    );

    const user = await this.userModel.findOne({
      email: {
        $regex: new RegExp(
          '^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$',
          'i',
        ),
      },
    });

    if (!user) {
      const errorMessage = 'Invalid email';
      this.logger.error(
        errorMessage,
        `${AuthService.name}#generateCustomerUpdateToken`,
        requestId,
      );

      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const oneDayInMillis = 1000 * 60 * 60 * 24;
    const tokenExpires = new Date(Date.now() + oneDayInMillis);

    await this.userModel.updateOne(
      { email },
      {
        customerUpdateToken: hashedToken,
        customerUpdateTokenExpires: tokenExpires,
      },
      {
        new: true,
      },
    );

    this.logger.log(
      'Token generated successfully:',
      `${AuthService.name}#CustomerUpdateToken`,
      requestId,
      token,
    );

    return { user, token };
  }

  async generateResetPasswordToken(
    email: string,
    requestId: string,
  ): Promise<{ user: UserDocument; token: string }> {
    this.logger.log(
      'Generating a token to reset password with params:',
      `${AuthService.name}#generateResetPasswordToken`,
      requestId,
      email,
    );

    const user = await this.userModel.findOne({
      email: {
        $regex: new RegExp(
          '^' + email.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$',
          'i',
        ),
      },
    });

    if (!user) {
      const errorMessage = 'Invalid email';
      this.logger.error(
        errorMessage,
        `${AuthService.name}#generateResetPasswordToken`,
        requestId,
      );

      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const oneDayInMillis = 1000 * 60 * 60 * 24;
    const tokenExpires = new Date(Date.now() + oneDayInMillis);

    await this.userModel.updateOne(
      { email },
      {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpires: tokenExpires,
      },
      {
        new: true,
      },
    );

    this.logger.log(
      'Token generated successfully:',
      `${AuthService.name}#generateResetPasswordToken`,
      requestId,
      token,
    );

    return { user, token };
  }

  async resetPasswordByToken(
    token: string,
    password: string,
    requestId: string,
  ) {
    this.logger.log(
      `Setting a new password for token ${token}`,
      `${AuthService.name}#setPasswordByToken`,
      requestId,
      token,
    );
    const hashedPassword = await this.userService.encryptPassword(password);
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const updateUserResponse = await this.userModel.updateOne(
      {
        resetPasswordToken: hashedToken,
        resetPasswordTokenExpires: { $gt: new Date() },
      },
      {
        resetPasswordToken: null,
        resetPasswordTokenExpires: null,
        password: hashedPassword,
      },
    );

    if (updateUserResponse.nModified < 1) {
      const errorMessage = `Invalid token`;
      this.logger.error(
        errorMessage,
        `${AuthService.name}#setPasswordByToken`,
        requestId,
        token,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, requestId),
      );
    }

    return true;
  }

  async updateCustomerData(
    request: any,
    token: string,
    ssn: string,
    annualIncome: string,
  ) {
    this.logger.log(
      `update ssn / annualincome for user id`,
      `${AuthService.name}#updateCustomerData`,
      request.id,
    );

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const findUser = await this.userModel.findOne({
      customerUpdateToken: hashedToken,
      customerUpdateTokenExpires: { $gt: new Date() },
    });

    if (!findUser) {
      const errorMessage = 'Invalid user';
      this.logger.error(
        errorMessage,
        `${AuthService.name}#updateCustomerData`,
        request.id,
      );

      throw new UnauthorizedException();
    }

    const updateUserResponse = await this.userModel.updateOne(
      {
        customerUpdateToken: hashedToken,
        customerUpdateTokenExpires: { $gt: new Date() },
      },
      {
        customerUpdateToken: null,
        customerUpdateTokenExpires: null,
        updatedSsn: ssn,
      },
    );

    if (updateUserResponse.nModified < 1) {
      const errorMessage = `Invalid token`;
      this.logger.error(
        errorMessage,
        `${AuthService.name}#updateCustomerData`,
        request.id,
        token,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, request.id),
      );
    }
    this.logger.log(
      `update ssn / annualincome for user id`,
      `${annualIncome} ... ${typeof annualIncome}#updateCustomerData`,
      request.id,
    );

    // console.log('PSK ...', parseInt(annualIncome), typeof annualIncome);
    const findscreenTracking = await this.screenTrackingModel.findOne({
      user: findUser._id,
    });

    const screenTracking = await this.screenTrackingModel.updateOne(
      { user: findUser._id },
      {
        updatedIncomeAmount: Math.trunc(
          parseFloat(`${annualIncome}`.replace(/[^0-9.]/g, '')),
        ),
      },
    );

    if (screenTracking.nModified < 1) {
      const errorMessage = `Invalid token`;
      this.logger.error(
        errorMessage,
        `${AuthService.name}#updateCustomerData`,
        request.id,
        token,
      );
      throw new BadRequestException(
        this.appService.errorHandler(400, errorMessage, request.id),
      );
    }

    const screenTracking1 = await this.screenTrackingModel.findOne({
      user: findUser._id,
    });
    if (!screenTracking1) {
      throw new UnauthorizedException();
    }

    const findUser1 = await this.userModel.findOne({
      _id: findUser._id,
    });
    if (!findUser1) {
      throw new UnauthorizedException();
    }

    await this.logActivityService.createLogActivityUpdateUser(
      request,
      logActivityModuleNames.LENDING_CENTER,
      `${findUser.email} - User Updated SSN / AnnualIncome.Updated SSN is ${findUser1.updatedSsn} and AnnualIncome is ${screenTracking1.updatedIncomeAmount}`,
      {
        userId: findUser._id,
      },
      findscreenTracking._id,
      findUser,
    );
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    requestId: string,
  ) {
    this.logger.log(
      `Changing password for user id ${userId}`,
      `${AuthService.name}#adminChangePassword`,
      requestId,
    );

    const user = await this.userModel.findById(userId);
    if (!user) {
      const errorMessage = `User id ${userId} not found`;
      this.logger.error(
        errorMessage,
        `${AuthService.name}#changePassword`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const oldPasswordCorrect = await bcrypt.compare(
      oldPassword.trim(),
      user.password,
    );

    if (!oldPasswordCorrect)
      throw new BadRequestException(
        this.appService.errorHandler(400, 'Incorrect password', requestId),
      );

    const newPassEncrypted = await this.userService.encryptPassword(
      newPassword,
    );
    await this.userModel.findByIdAndUpdate(userId, {
      password: newPassEncrypted,
    });
    this.logger.log(
      `Password changed for user id ${userId}`,
      `${AuthService.name}#changePassword`,
      requestId,
    );
  }

  async adminChangePassword(
    adminId: string,
    oldPassword: string,
    newPassword: string,
    requestId: string,
  ) {
    this.logger.log(
      `Changing password for admin user id ${adminId}`,
      `${AuthService.name}#adminChangePassword`,
      requestId,
    );

    const admin = await this.adminModel.findById(adminId);
    if (!admin) {
      const errorMessage = `User id ${adminId} not found`;
      this.logger.error(
        errorMessage,
        `${AuthService.name}#adminChangePassword`,
        requestId,
      );
      throw new NotFoundException(
        this.appService.errorHandler(404, errorMessage, requestId),
      );
    }

    const oldPasswordCorrect = await bcrypt.compare(
      oldPassword.trim(),
      admin.password,
    );

    if (!oldPasswordCorrect)
      throw new BadRequestException(
        this.appService.errorHandler(400, 'Incorrect password', requestId),
      );

    const newPassEncrypted = await this.userService.encryptPassword(
      newPassword,
    );
    await this.adminModel.findByIdAndUpdate(adminId, {
      password: newPassEncrypted,
    });
    this.logger.log(
      `Password changed for admin user id ${adminId}`,
      `${AuthService.name}#adminChangePassword`,
      requestId,
    );
  }

  async adminForgotPassword(
    adminForgotPasswordDto: AdminForgotPasswordDto,
    requestId: string,
  ) {
    this.logger.log(
      `Resetting password for admin with email ${adminForgotPasswordDto.email}`,
      `${AuthService.name}#setPasswordByToken`,
      requestId,
    );
    const admin: AdminDocument | null = await this.adminModel.findOne({
      email: {
        $regex: new RegExp(
          '^' +
            adminForgotPasswordDto.email.replace(
              /[-\/\\^$*+?.()|[\]{}]/g,
              '\\$&',
            ) +
            '$',
          'i',
        ),
      },
    });
    if (!admin) {
      const errorMessage = 'Invalid email';
      this.logger.error(
        errorMessage,
        `${AuthService.name}#adminForgotPassword`,
        requestId,
      );

      throw new UnauthorizedException();
    }

    const newPassword: string = await this.generateRandomPassword();
    admin.password = await this.generateEncryptedPassword(newPassword);
    await admin.save();

    const baseUrl = this.configService.get<string>('VUE_APP_URL');
    const html = await this.nunjucksService.htmlToString(
      'emails/admin-reset-password.html',
      {
        link: `${baseUrl}/admin/login`,
        password: newPassword,
        userName: admin.userName,
      },
    );
    const subject = 'Password reset request';
    const from = 'no-reply@patrialending.com';
    const to = admin.email;

    await this.mailService.sendEmail(from, to, subject, html, requestId);
    this.logger.log(
      `Password for admin with email ${adminForgotPasswordDto.email} has been reset`,
      `${AuthService.name}#adminForgotPassword`,
      requestId,
    );
  }

  async generateEncryptedPassword(password: string): Promise<string> {
    const hash = await bcrypt.hash(password, 10);
    return hash;
  }

  async generateRandomPassword(): Promise<string> {
    return passwordGenerator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      strict: true,
    });
  }
}
