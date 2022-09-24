import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { Model } from 'mongoose';
import moment from 'moment';

import { AdminDashboardService } from './admin-dashboard.service';
import { JwtAuthGuard } from '../../user/auth/jwt-auth.guard';
import { Role } from '../../user/auth/roles/role.enum';
import { Roles } from '../../user/auth/roles/roles.decorator';
import { RolesGuard } from '../../user/auth/roles/roles.guard';
import { LoggerService } from '../../logger/logger.service';
import { PaymentManagement } from '../payments/payment-management/payment-management.schema';
import { ValidateObjectIdPipe } from './pipes/validateObjectId.pipe';
import { UserService } from '../../user/user.service';
import { AdminJwtPayload } from '../../user/auth/types/jwt-payload.types';
import { PaymentService } from '../payments/payment.service';
import { MakePaymentDialogDto } from './dtos/makePaymentDialog.dto';
import { MakePaymentDialogPipe } from './pipes/makePaymentDialog.pipe';
import { LoanpaymentproService } from '../payments/loanpaymentpro/loanpaymentpro.service';
import { SubmitPaymentDto } from './dtos/submit-payment.dto';
import { promisetoPay } from './dtos/promisetoPay.dto';
import { ChangePaymentAmountDto } from './dtos/change-payment-amount.dto';
import { LoanSettingsDto, StatusApproval } from './dtos/loan-settings.dto';
import { AddCardDto } from '../payments/loanpaymentpro/validation/addCard.dto';
import { LoanPaymentProCardTokenDocument } from '../payments/loanpaymentpro/schemas/loanpaymentpro-card-token.schema';
import { InjectModel } from '@nestjs/mongoose';
import {
  PracticeManagement,
  PracticeManagementDocument,
} from '../practice-management/practice-management.schema';
import { AppService } from '../../app.service';
import { AddCardPipe } from '../payments/loanpaymentpro/validation/addCard.pipe';
import {
  LogActivityService,
  logActivityModuleNames,
} from '../../user/log-activity/log-activity.service';
import { ConsentService } from '../../user/consent/consent.service';
import { GenerateEFTADto } from '../../user/application/validation/generateEFTA.dto';
import { LoanSettingsService } from '../loan-settings/loan-settings.service';
import { UserBankAccountService } from '../../user/user-bank-account/user-bank-account.service';

import { ConfigService } from '@nestjs/config';
import { NunjucksCompilerService } from '../../nunjucks-compiler/nunjucks-compiler.service';
import { MandrillService } from '../../mandrill/mandrill.service';
import { UserDocument } from '../../user/user.schema';
@Controller('/api/admin/dashboard')
export class AdminDashboardController {
  constructor(
    @InjectModel(PracticeManagement.name)
    private readonly PracticeManagementModel: Model<PracticeManagementDocument>,
    private readonly adminDashboardService: AdminDashboardService,
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly logActivityService: LogActivityService,
    private readonly logger: LoggerService,
    private readonly appService: AppService,
    private readonly consentService: ConsentService,
    private readonly loanSettingsService: LoanSettingsService,
    private readonly userBankAccountService: UserBankAccountService,
    private readonly configService: ConfigService,
    private readonly mailService: MandrillService,
    private readonly nunjucksService: NunjucksCompilerService,
  ) { }

  @Get('loans')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getApplications(
    @Query('status')
    status: PaymentManagement['status'],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(50), ParseIntPipe) perPage: number,
    @Query('search', new DefaultValuePipe('')) search: string,
    @Query('type', new DefaultValuePipe('')) type: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const applications =
        await this.adminDashboardService.getApplicationByStatus(
          status,
          page,
          perPage,
          search,
          request.id,
          type,
        );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getApplications`,
        request.id,
      );

      return applications;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getApplications`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('verify-email/:token')
  // @Roles(Role.SuperAdmin, Role.UserServicing)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  async verifySecondayEmail(
    @Param('token') token: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.adminDashboardService.verifyEmailToken(token);
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getApplications`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Put('loans/userInfo')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateUserData(@Body() payload: any) {
    const result = await this.adminDashboardService.updateUserData(payload);
    return result;
  }

  @Post('loan-status')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async approvedAndDeniedApplication(
    @Req() request: Request & { user: AdminJwtPayload },
    @Body() payload: StatusApproval,
  ) {
    const { id, userName, email, role, practiceManagement } = request.user;
    const { screentrackingId, status } = payload;

    const response = await this.adminDashboardService.changeApplicationStatus(
      payload,
    );

    if (response.data) {
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${email} - ${role}  ${status} the          
        ${response?.data?.applicationReference}`,
        {
          id,
          email,
          role,
          userName,
          adminPracticeManagementId: practiceManagement,
          screentrackingId,
        },
        response?.data?.applicationReference,
        undefined,
        screentrackingId,
      );
    }

    return response;
  }

  @Get('loans/counters')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getLoanCounters(@Req() request: Request) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getLoanCounters`,
      request.id,
    );

    try {
      const stats = await this.adminDashboardService.getLoanCounters(
        request.id,
      );
      this.logger.log(
        'Return data:',
        `${AdminDashboardController.name}#getLoanCounters`,
        request.id,
        stats,
      );

      return stats;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getLoanCounters`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('application/ruleDetails/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getRulesDetailsByScreenId(
    @Req() request: Request & { user: AdminJwtPayload },
    @Param('screenTrackingId') screenTrackingId: string,
  ) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getApplicationInfo`,
      request.id,
    );

    try {
      const response = await this.adminDashboardService.getRulesDetails(
        screenTrackingId,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.LOAN_DETAILS,
        `${request.user.email} - ${role} Viewing Rules details`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        response.financingReferenceNumber,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getApplicationInfo`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getApplicationInfo`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('application/info/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getApplicationInfo(
    @Req() request: Request & { user: AdminJwtPayload },
    @Param('screenTrackingId') screenTrackingId: string,
  ) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getApplicationInfo`,
      request.id,
    );

    try {
      const response = await this.adminDashboardService.getApplicationInfo(
        screenTrackingId,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      // await this.logActivityService.createLogActivity(
      //   request,
      //   logActivityModuleNames.LOAN_DETAILS,
      //   `${request.user.email} - ${role} Viewing loan details`,
      //   {
      //     id,
      //     email,
      //     role,
      //     userName,
      //     practiceManagementId: practiceManagement,
      //     screenTrackingId,
      //   },
      //   response.financingReferenceNumber,
      //   undefined,
      //   screenTrackingId,
      // );
      //temporary
      const today: Date = moment().startOf('day').toDate();
      // await this.logActivityService.createLogActivity(
      //   request,
      //   'Communication',
      //   `${request.user.email} - ${role} Email sent`,
      //   {
      //     id,
      //     email,
      //     role,
      //     userName,
      //     practiceManagementId: practiceManagement,
      //     screenTrackingId,
      //   },
      //   response.financingReferenceNumber,
      //   undefined,
      //   screenTrackingId,
      //   [
      //     {
      //       date: today,
      //       method: 'Email',
      //       email: 'taher.syed@trustalchemy.com',
      //       summary: '',
      //     },
      //   ],
      // );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getApplicationInfo`,
        request.id,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getApplicationInfo`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('users/:userId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getUserInfo(
    @Req() request: Request,
    @Param('userId', ValidateObjectIdPipe) userId: string,
  ) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getUserInfo`,
      request.id,
      userId,
    );

    try {
      const info = await this.userService.getInfo(userId, request.id);
      this.logger.log(
        'Return user info: ',
        `${AdminDashboardController.name}#getUserInfo`,
        request.id,
        info,
      );

      return info;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getUserInfo`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('resignEFTA/:screenTrackingId/:cardToken')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getResignEFTA(
    // @Body() generateEFTADto: GenerateEFTADto,
    @Req() request: Request,
    @Param('screenTrackingId', ValidateObjectIdPipe) screenTrackingId: string,
    @Param('cardToken') cardToken: string,
  ) {
    try {
      const response = await this.consentService.resignEFTA(
        screenTrackingId,
        cardToken,
        request,
      );

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#resignEFTA`,
        request.id,
      );

      return { documentId: response };
    } catch (error) {
      this.logger.error(
        'Error',
        `${AdminDashboardController.name}#resignEFTA`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('efta/')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async generateEFTA(
    @Body() generateEFTADto: GenerateEFTADto,
    @Req() request: Request,
  ) {
    const id = generateEFTADto.userId
      ? generateEFTADto.userId
      : request.user.id;
    try {
      const response = await this.consentService.createEFTAAgreement(
        id,
        generateEFTADto,
        request,
      );

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#generateEFTA`,
        request.id,
      );

      return { documentId: response };
    } catch (error) {
      this.logger.error(
        'Error',
        `${AdminDashboardController.name}#generateEFTA`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('creditReport/:screenTrackingId')
  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getCreditReport(
    @Req() request: Request,
    @Param('screenTrackingId', ValidateObjectIdPipe) screenTrackingId: string,
  ) {
    this.logger.log(
      'Request params:',
      `${AdminDashboardController.name}#getCreditReport`,
      request.id,
      screenTrackingId,
    );

    try {
      const info = await this.adminDashboardService.getCreditReport(
        screenTrackingId,
        request.id,
      );
      this.logger.log(
        'Return user info: ',
        `${AdminDashboardController.name}#getCreditReport`,
        request.id,
        info,
      );

      return info;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getCreditReport`,
        request.id,
        error,
      );
      throw error;
    }
  }

  // @Get('creditReport/:screenTrackingId')
  // @Roles(Role.SuperAdmin)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // async getClarityReport(
  //   @Req() request: Request,
  //   @Param('screenTrackingId', ValidateObjectIdPipe) screenTrackingId: string,
  // ) {
  //   try {
  //   } catch (error) {
  //     this.logger.error(
  //       'Error:',
  //       `${AdminDashboardController.name}#getClarityReport`,
  //       request.id,
  //       error,
  //     );
  //     throw error;
  //   }
  // }

  @Get('loans/paymentSchedule/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPaymentSchedule(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request,
  ) {
    try {
      const response = await this.adminDashboardService.getPaymentSchedule(
        screenTrackingId,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getPaymentSchedule`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getPaymentSchedule`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('users/bank-accounts/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addBankAccount(
    @Req() request,
    @Param('screenTrackingId') screenTrackingId: string,
    @Body() body,
  ) {
    const user = request.user;
    const payload = Object.assign(
      { user: user.id, screentracking: screenTrackingId },
      body,
    );

    return this.userBankAccountService.createUserBankAccount(payload);
  }

  @Get('users/bank-accounts/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async listBankAccounts(
    @Req() request,
    @Param('screenTrackingId') screenTrackingId,
  ) {
    const user = request.user;
    return this.userBankAccountService.listUserAccounts(
      user.id,
      screenTrackingId,
    );
  }

  @Post('users/cards/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async addLoanPaymentProCard(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body() addCardDto: AddCardDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    addCardDto.screenTrackingId = screenTrackingId;

    try {
      // change to FlexPay
      // const response: LoanPaymentProCardTokenDocument =
      //   await this.loanPaymentProService.v2PaymentCardsAdd(
      //     addCardDto,
      //     request.id,
      //   );
      const response = await this.loanPaymentProService.addCardViaFlexPay(
        addCardDto,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.ACCOUNTS,
        `${request.user.email} - ${role} Added card id ${response?.data?._id}. Card Holder is ${response?.data?.cardNumberLastFour}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
          userId: response?.data?.user,
          cardId: response?.data?._id,
        },
        undefined,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 201:',
        `${AdminDashboardController.name}#addLoanPaymentProCard`,
        request.id,
      );

      return response;
    } catch (error) {
      console.log('Errrpr==============', error);
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#addLoanPaymentProCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Patch('users/cards/:paymentMethodToken')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateLoanPaymentProCard(
    @Param('paymentMethodToken') paymentMethodToken: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      await this.loanPaymentProService.updateCard(
        paymentMethodToken,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#updateLoanPaymentProCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('users/cards/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getLoanPaymentProCards(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.loanPaymentProService.getUserCards(
        screenTrackingId,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getLoanPaymentProCards`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getLoanPaymentProCards`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('remove-accounts')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  // @UsePipes(new ValidationPipe())
  async removeAchOrCard(
    @Req() request: Request & { user: AdminJwtPayload },
    @Body()
    payload: {
      paymentType: 'ACH' | 'CARD';
      paymentId: string;
      screenTrackingId: string;
    },
  ) {
    const { screenTrackingId } = payload;
    const response = await this.loanPaymentProService.removeAchOrCard(payload);
    console.log('first', response.data);
    const { id, userName, email, role, practiceManagement } = request.user;
    await this.logActivityService.createLogActivity(
      request,
      logActivityModuleNames.ACCOUNTS,
      `${request.user.email} - ${role} Removed card id ${response?.data?._id}. Card Holder is ${response?.data?.billingFirstName} and last four digit is  ${response?.data?.cardNumberLastFour}`,
      {
        id,
        email,
        role,
        userName,
        practiceManagementId: practiceManagement,
        screenTrackingId,
        userId: response?.data?.user,
        cardId: response?.data?._id,
      },
      response?.screenData?.applicationReference,
      undefined,
      screenTrackingId,
    );

    return response.data;
  }

  @Get('loans/previewPayment/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async previewPayment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Query(new MakePaymentDialogPipe()) makePaymentDto: MakePaymentDialogDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      makePaymentDto.screenTracking = screenTrackingId;
      const response = await this.paymentService.makePaymentRenderDialog(
        makePaymentDto,
        request.id,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#previewPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#previewPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('loans/submitPayment/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async submitPayment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new MakePaymentDialogPipe()) submitPaymentDto: SubmitPaymentDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    submitPaymentDto.screenTracking = screenTrackingId;
    try {
      const response = await this.paymentService.submitPayment(
        submitPaymentDto,
        request.id,
      );

      const { id, userName, email, role, practiceManagement } = request.user;
      if (response) {
        await this.logActivityService.createLogActivity(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${request.user.email} - ${role} Made payment with amount ${response.amount}. Payment reference ${response.paymentReference}. Payment id ${response._id}`,
          {
            id,
            email,
            role,
            userName,
            adminPracticeManagementId: practiceManagement,
            screenTrackingId,
            paymentId: response._id,
            paymentManagementId: response.paymentManagement as string,
            paymentStatus: response.status,
            customerPracticeManagementId: response.practiceManagement as string,
          },
          undefined,
          response.paymentManagement as string,
          screenTrackingId,
        );
      } else {
        await this.logActivityService.createLogActivity(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${request.user.email} - ${role} Scheduled payment for ${moment(
            submitPaymentDto.paymentDate,
          ).format('MM/DD/YYYY')} with amount ${submitPaymentDto.amount}`,
          {
            id,
            email,
            role,
            userName,
            adminPracticeManagementId: practiceManagement,
            screenTrackingId,
          },
          undefined,
          undefined,
          screenTrackingId,
        );
      }

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#submitPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#submitPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('loans/amendPayment/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async amendPayment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new MakePaymentDialogPipe()) submitPaymentDto: SubmitPaymentDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    submitPaymentDto.screenTracking = screenTrackingId;
    try {
      const response = await this.paymentService.amendPayment(
        submitPaymentDto,
        request.id,
      );

      const { id, userName, email, role, practiceManagement } = request.user;
      if (response) {
        await this.logActivityService.createLogActivity(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${request.user.email} - ${role} Made Amendpayment with amount ${response.amount}. Payment reference ${response.paymentReference}. Payment id ${response._id}`,
          {
            id,
            email,
            role,
            userName,
            adminPracticeManagementId: practiceManagement,
            screenTrackingId,
            paymentId: response._id,
            paymentManagementId: response.paymentManagement as string,
            paymentStatus: response.status,
            customerPracticeManagementId: response.practiceManagement as string,
          },
          undefined,
          response.paymentManagement as string,
          screenTrackingId,
        );
      } else {
        await this.logActivityService.createLogActivity(
          request,
          logActivityModuleNames.PAYMENT_SCHEDULE,
          `${request.user.email} - ${role} Scheduled payment for ${moment(
            submitPaymentDto.paymentDate,
          ).format('MM/DD/YYYY')} with amount ${submitPaymentDto.amount}`,
          {
            id,
            email,
            role,
            userName,
            adminPracticeManagementId: practiceManagement,
            screenTrackingId,
          },
          undefined,
          undefined,
          screenTrackingId,
        );
      }

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#submitPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#submitPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('loans/promisetopay/:paymentId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async promisetoPay(
    @Param('paymentId') paymentId: string,
    @Body(new ValidationPipe()) promisetoPay: promisetoPay,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.paymentService.promisetoPay(
        promisetoPay,
        request.id,
      );

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#promisetoPay`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#promisetoPay`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('loans/promisetopay/changestatus/:paymentManagementId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async changeStatusPromisetopay(
    @Param('paymentManagementId') paymentManagementId: string,
    @Body(new ValidationPipe()) promisetoPay: promisetoPay,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.paymentService.changeStatusPromisetopay(
        paymentManagementId,
        promisetoPay.promiseScheduleDate,
        promisetoPay.promiseScheduleStatus,
        request.id,
      );

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#changeStatusPromisetopay`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#changeStatusPromisetopay`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('loans/promisetopay/update/:paymentManagementId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updatePromisetopay(
    @Param('paymentManagementId') paymentManagementId: string,
    @Body(new ValidationPipe()) promisetoPay: promisetoPay,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.paymentService.updatePromisetopay(
        paymentManagementId,
        promisetoPay.promiseScheduleDate,
        promisetoPay.promisedPayAmount,
        promisetoPay.newPromiseDate,
        request.id,
      );

      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#updatePromisetopay`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#updatePromisetopay`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Patch('loans/changePaymentAmount/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async changePaymentAmount(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new ValidationPipe()) changePaymentAmountDto: ChangePaymentAmountDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    changePaymentAmountDto.screenTracking = screenTrackingId;

    try {
      await this.adminDashboardService.changeMonthlyPaymentAmount(
        changePaymentAmountDto,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${request.user.email} - ${role} Changed current payment amount to ${changePaymentAmountDto.amount}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#changePaymentAmount`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#changePaymentAmount`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Patch('loans/changePromoAmount/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async changePromoAmount(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new ValidationPipe()) changePaymentAmountDto: ChangePaymentAmountDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    changePaymentAmountDto.screenTracking = screenTrackingId;

    try {
      await this.adminDashboardService.changeMonthlyPromoAmount(
        changePaymentAmountDto,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${request.user.email} - ${role} Changed current payment amount to ${changePaymentAmountDto.amount}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#changePaymentAmount`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#changePaymentAmount`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Patch('loans/checkPromoAmount/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async checkPromoAmount(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body(new ValidationPipe()) changePaymentAmountDto: ChangePaymentAmountDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    changePaymentAmountDto.screenTracking = screenTrackingId;

    try {
      await this.adminDashboardService.changeMonthlyPromoAmount(
        changePaymentAmountDto,
        request.id,
      );
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${request.user.email} - ${role} Changed current payment amount to ${changePaymentAmountDto.amount}`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#changePaymentAmount`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#changePaymentAmount`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Patch('loans/toggleAutopay/:paymentManagementId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async toggleAutopay(
    @Param('paymentManagementId') paymentManagementId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      await this.paymentService.triggerAutoPay(request, paymentManagementId);
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#updateLoanPaymentProCard`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Get('loans/settings')
  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getLoanSettings(@Req() request: Request & { user: AdminJwtPayload }) {
    try {
      const loanSettings = await this.loanSettingsService.getLoanSettings();

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#getLoanSettings`,
        request.id,
      );
      return loanSettings;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#getLoanSettings`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Patch('loans/settings')
  @Roles(Role.SuperAdmin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateLoanSettings(
    @Body(new ValidationPipe()) loanSettingsDto: LoanSettingsDto,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const originalLoanSettings =
        await this.loanSettingsService.getLoanSettings();
      await this.loanSettingsService.updateLateFee(loanSettingsDto.lateFee);
      if (loanSettingsDto.nsfFee) {
        await this.loanSettingsService.updateNSFFee(loanSettingsDto.nsfFee);
      }
      if (loanSettingsDto.lateFeeGracePeriod) {
        await this.loanSettingsService.updateLateFeeGracePeriod(
          loanSettingsDto.lateFeeGracePeriod,
        );
      }
      if (loanSettingsDto.eventsUrl) {
        await this.loanSettingsService.updateEventsUrl(
          loanSettingsDto.eventsUrl,
        );
      }
      if (loanSettingsDto.eventsAuthToken) {
        await this.loanSettingsService.updateEventsAuthToken(
          loanSettingsDto.eventsAuthToken,
        );
      }
      if (loanSettingsDto.delinquencyPeriod) {
      }
      const loanSettings =
        await this.loanSettingsService.updateDelinquencyPeriod(
          loanSettingsDto.delinquencyPeriod || 0,
        );

      // if (loanSettings == null) {
      //   loanSettings = await this.loanSettingsService.updateSettingsData(
      //     loanSettingsDto.lateFee,
      //     loanSettingsDto.nsfFee,
      //     loanSettingsDto.lateFeeGracePeriod,
      //     loanSettingsDto.delinquencyPeriod,
      //   );
      // }
      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.LOAN_SETTINGS,
        `${request.user.email} - ${role} 
          Updated loan settings from 
          Late Fee: $${originalLoanSettings.lateFee} -> $${loanSettings.lateFee},
          NSF Fee: $${originalLoanSettings.nsfFee} -> $${loanSettings.nsfFee},
          Late Fee Grace Period: ${originalLoanSettings.lateFeeGracePeriod} days -> ${loanSettings.lateFeeGracePeriod} days,
          Delinquency Period: ${originalLoanSettings.delinquencyPeriod} days -> ${loanSettings.delinquencyPeriod} days
        `,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          undefined,
        },
        undefined,
        undefined,
      );

      this.logger.log(
        'Response status 200',
        `${AdminDashboardController.name}#updateLoanSettings`,
        request.id,
      );
      return loanSettings;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#updateLoanSettings`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('loans/forgivePayment/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async forgivePayment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.adminDashboardService.forgivePayment(
        screenTrackingId,
        request.id,
      );

      // const { id, userName, email, role, practiceManagement } = request.user;
      // await this.logActivityService.createLogActivity(
      //   request,
      //   logActivityModuleNames.PAYMENT_SCHEDULE,
      //   `${request.user.email} - ${role} Forgive last Payment for user.`,
      //   {
      //     id,
      //     email,
      //     role,
      //     userName,
      //     practiceManagementId: practiceManagement,
      //     screenTrackingId,
      //   },
      //   undefined,
      //   undefined,
      //   screenTrackingId,
      // );
      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#forgiveLastPayment`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#forgiveLastPayment`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('loans/forgiveLatefee/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async forgiveLateFee(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.adminDashboardService.forgiveLatefee(
        screenTrackingId,
        request.id,
      );

      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${request.user.email} - ${role} Forgive late fees for user.`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );
      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#forgiveLateFee`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#forgiveLateFee`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('loans/forgiveSingleLateFee/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.Manager, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async forgiveSingleLateFee(
    @Param('screenTrackingId') screenTrackingId: string,
    @Body() payment: any,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const splitDate = payment.date
        .toString()
        .split('T')[0]
        .split('-')
        .reverse()
        .join('/')
        .split(/\//);
      const finalDate = [splitDate[1], splitDate[0], splitDate[2]].join('/');

      const response = await this.adminDashboardService.forgiveSingleLatefee(
        screenTrackingId,
        request.id,
        payment.transactionId,
      );

      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${request.user.email} - ${role} Forgive Late fee for user with amount of ${payment.amount} on date ${finalDate}.`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );
      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#forgiveSingleLateFee`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#forgiveSingleLateFee`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('loans/deferPayment/:screenTrackingId')
  @Roles(Role.SuperAdmin, Role.UserServicing)
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deferPayment(
    @Param('screenTrackingId') screenTrackingId: string,
    @Req() request: Request & { user: AdminJwtPayload },
  ) {
    try {
      const response = await this.adminDashboardService.deferPayment(
        screenTrackingId,
        request.id,
      );

      const { id, userName, email, role, practiceManagement } = request.user;
      await this.logActivityService.createLogActivity(
        request,
        logActivityModuleNames.PAYMENT_SCHEDULE,
        `${request.user.email} - ${role} Defered next available payment.`,
        {
          id,
          email,
          role,
          userName,
          practiceManagementId: practiceManagement,
          screenTrackingId,
        },
        undefined,
        undefined,
        screenTrackingId,
      );
      this.logger.log(
        'Response status 201',
        `${AdminDashboardController.name}#forgiveLateFee`,
        request.id,
      );
      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${AdminDashboardController.name}#forgiveLateFee`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
