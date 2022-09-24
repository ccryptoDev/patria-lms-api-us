import {
  Body,
  Controller,
  ForbiddenException,
  NotFoundException,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';

import {
  PracticeManagement,
  PracticeManagementDocument,
} from '../../../loans/practice-management/practice-management.schema';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../../../user/screen-tracking/screen-tracking.schema';
import { UserDocument } from '../../../user/user.schema';
import { ProductService } from '../product/product.service';
import { TransunionService } from './transunion.service';
import { CreditInquiryDto } from './validation/creditInquiry.dto';
import {
  LoanInterestRate,
  LoanInterestRateDocument,
} from '../../../loans/interest-rate/interest-rate.schema';
import { JwtAuthGuard } from '../../../user/auth/jwt-auth.guard';
import { LoggerService } from '../../../logger/logger.service';
import { AppService } from '../../../app.service';
import { PaymentManagementService } from '../../../loans/payments/payment-management/payment-management.service';

@UseGuards(JwtAuthGuard)
@Controller('/api/application')
export class TransunionController {
  constructor(
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    @InjectModel(PracticeManagement.name)
    private readonly practiceManagementModel: Model<PracticeManagementDocument>,
    @InjectModel(LoanInterestRate.name)
    private readonly loanInterestRateModel: Model<LoanInterestRateDocument>,
    private readonly transUnionService: TransunionService,
    private readonly paymentManagementService: PaymentManagementService,
    private readonly productService: ProductService,
    private readonly appService: AppService,
    private readonly logger: LoggerService,
  ) {}

  @Post('creditBureauInquiry')
  @UsePipes(new ValidationPipe())
  async creditBureauInquiry(
    @Body() creditInquiryDto: CreditInquiryDto,
    @Req() request: Request,
  ) {
    creditInquiryDto.screenTrackingId = request.user.screenTracking;
    try {
      const screenTracking: ScreenTrackingDocument = await this.screenTrackingModel
        .findOne({
          _id: creditInquiryDto.screenTrackingId,
        })
        .populate('user');
      if (!screenTracking) {
        this.logger.error(
          'Screen tracking not found',
          `${TransunionController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            `Screen tracking id ${screenTracking} not found`,
            request.id,
          ),
        );
      }
      const user = screenTracking.user as UserDocument;
      if (!user) {
        this.logger.error(
          'User not found',
          `${TransunionController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            'user for this screen tracking not found',
            request.id,
          ),
        );
      }
      const practiceManagement = await this.practiceManagementModel.findOne({
        _id: screenTracking.practiceManagement,
      });
      if (!practiceManagement) {
        this.logger.error(
          'Practice management not found',
          `${TransunionController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            'practiceManagement for this screen tracking not found',
            request.id,
          ),
        );
      }
      if (screenTracking.creditScore >= 0 || screenTracking.deniedMessage) {
        const errorMessage = 'User already has a credit report';
        this.logger.error(
          errorMessage,
          `${TransunionController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new ForbiddenException(
          this.appService.errorHandler(403, errorMessage, request.id),
        );
      }

      const creditReportResponse = await this.transUnionService.runCreditReport(
        creditInquiryDto.hardPull,
        screenTracking,
        user,
        request.id,
      );

      const creditReport =
        creditReportResponse.transUnionHistory?.responseData?.creditBureau;
      if (!creditReport) {
        this.logger.error(
          'No credit report',
          `${TransunionController.name}#creditBureauInquiry`,
          request.id,
        );
        throw new NotFoundException(
          this.appService.errorHandler(
            404,
            'Error attempting to retrieve your credit details.',
            request.id,
          ),
        );
      }

      const stage1Rules = await this.productService.getStage1Rules(
        user,
        screenTracking,
        request.id,
      );
      const stage2Rules = await this.productService.getStage2Rules(
        creditReport,
        user.practiceManagement as string,
        request.id,
      );

      const rulesDetails = {
        approvedRuleMsg: [
          ...stage1Rules.approvedRuleMsg,
          ...stage2Rules.approvedRuleMsg,
        ],
        declinedRuleMsg: [
          ...stage1Rules.declinedRuleMsg,
          ...stage2Rules.declinedRuleMsg,
        ],
        ruleData: {
          ...stage1Rules.ruleData,
          ...stage2Rules.ruleData,
        },
        // ...stage1Rules.ruleApprovals,
        // ...stage2Rules.ruleApprovals,
        loanApproved: stage1Rules.loanApproved,
        totalAdjWeight: stage2Rules.totalAdjWeight,
      };

      const screenUpdateObj: any = {
        adjRulesWeight: rulesDetails.totalAdjWeight,
        applicationType: 'Application wizard',
        creditScore: creditReportResponse.creditScore || 0,
        incomeAmount: '' + parseFloat(screenTracking.incomeAmount + '' || '0'),
        lastLevel: rulesDetails.loanApproved ? 'offers' : 'denied',
        product: this.productService.getProductId(),
        rulesDetails: rulesDetails,
      };
      const lowestGradeLoanInterestRate = await this.loanInterestRateModel
        .findOne({
          stateCode: practiceManagement.stateCode,
        })
        .sort({ grade: -1 });
      const creditReportError = creditReport.product.error;
      const transunionError =
        creditReportResponse.transUnionHistory.responseData.error;
      let lockToLowestTier = false;
      if (creditReportError) {
        screenUpdateObj.deniedMessage = `Application assigned to tier ${lowestGradeLoanInterestRate.grade} due to: ${creditReport.product.error.description}`;
        lockToLowestTier = true;
      }
      if (transunionError) {
        screenUpdateObj.deniedMessage = `Application assigned to tier ${lowestGradeLoanInterestRate.grade} due to: ${transunionError.errortext} (Error code: ${transunionError.errorcode})`;
        lockToLowestTier = true;
      }
      if (lockToLowestTier) {
        screenUpdateObj.lockCreditTier = lowestGradeLoanInterestRate.grade;
      }
      await this.screenTrackingModel.updateOne(
        { _id: screenTracking._id },
        screenUpdateObj,
      );

      const response = { isLoanApproved: false };
      if (!rulesDetails.loanApproved) {
        await this.paymentManagementService.createPaymentManagement(
          screenTracking,
          'denied',
          request.id,
        );
      } else {
        response.isLoanApproved = true;
      }

      this.logger.log(
        'Response status 201',
        `${TransunionController.name}#creditBureauInquiry`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${TransunionController.name}#creditBureauInquiry`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
