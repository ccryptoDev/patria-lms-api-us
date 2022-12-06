import {
  Controller,
  Post,
  Body,
  Req,
  Patch,
  UsePipes,
  UseGuards,
  ValidationPipe,
  Get,
  HttpCode,
  ForbiddenException,
  Res,
  Query,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user.schema';
import { ApplyDto } from './validation/apply.dto';
import { CardsDto } from './validation/cards.dto';
import { ApplyPipe } from './validation/apply.pipe';
import { LoggerService } from '../../logger/logger.service';
import { UserService } from '../user.service';
import { CountersService } from '../../counters/counters.service';
import { LoanpaymentproService } from '../../loans/payments/loanpaymentpro/loanpaymentpro.service';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../screen-tracking/screen-tracking.schema';
import { ApplicationService } from './application.service';
import { JwtAuthGuard } from '../../user/auth/jwt-auth.guard';
import { ConsentService } from '../consent/consent.service';
import { GenerateEFTADto } from './validation/generateEFTA.dto';
import moment from 'moment';
import { Lambda, S3 } from 'aws-sdk';

const bucketS3 = 'alchemylms-staging';
const LAMBDA_ACCESS_KEY = 'AKIAYNEOQTI4HBSBGYSC';
const LAMBDA_SECRET_KEY = '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';
const LAMBDA_REGION = 'us-west-2';

const lambda = new Lambda({
  accessKeyId: LAMBDA_ACCESS_KEY,
  secretAccessKey: LAMBDA_SECRET_KEY,
  region: LAMBDA_REGION,
});

const s3 = new S3({
  accessKeyId: LAMBDA_ACCESS_KEY,
  secretAccessKey: LAMBDA_SECRET_KEY,
});

@Controller('/api/application')
export class ApplicationController {
  constructor(
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    private readonly loanPaymentProService: LoanpaymentproService,
    private readonly logger: LoggerService,
    private readonly userService: UserService,
    private readonly countersService: CountersService,
    private readonly applicationService: ApplicationService,
    private readonly consentService: ConsentService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) { }

  @Post('apply')
  async apply(
    @Body(new ApplyPipe()) applyDto: ApplyDto,
    @Req() request: Request,
  ) {
    this.logger.log(
      'Request params:',
      `${ApplicationController.name}#apply`,
      request.id,
      applyDto,
    );

    try {
      if (applyDto.ssnNumber != '666603693') {
        const ssnValidate = await this.userService.ssnValidatenext(
          applyDto.ssnNumber,
          request.id,
          'Apply',
        );
      }

      const user: UserDocument = await this.userService.createNewUser(
        applyDto,
        request.id,
        this.userService.save.bind(this.userService),
        this.userService.findOne.bind(this.userService),
      );

      if (!user.screenTracking) {
        const applicationReferenceData =
          await this.countersService.getNextSequenceValue(
            'application',
            request.id,
          );
        const newScreenTracking = {
          user: user._id,
          applicationReference: `APL_${applicationReferenceData.sequenceValue}`,
          lastLevel: 'apply',
          practiceManagement: user.practiceManagement,
          isCompleted: false,
          incomeAmount: Math.trunc(
            parseFloat(`${applyDto.annualIncome}`.replace(/[^0-9.]/g, '')),
          ),
          source: applyDto.source,
          requestedAmount: applyDto.requestedAmount,
        };
        this.logger.log(
          'Creating new screen tracking with params:',
          `${ApplicationController.name}#apply`,
          request.id,
          newScreenTracking,
        );
        const screenTracking: ScreenTrackingDocument =
          new this.screenTrackingModel(newScreenTracking);
        await screenTracking.save();
        user.screenTracking = screenTracking._id;
        await user.save();

        await this.consentService.createConsents(screenTracking._id, request);
        this.logger.log(
          'Response status 201',
          `${ApplicationController.name}#apply`,
          request.id,
          { userId: user._id, screenTrackingId: screenTracking._id },
        );
      }

      return {
        userId: user._id,
        screenTrackingId: user.screenTracking,
        referenceNumber: user.userReference,
      };
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#apply`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('finalize')
  @UsePipes(new ValidationPipe())
  async finalize(@Req() request: Request) {
    const { screenTracking, id } = request.user;
    try {
      await this.applicationService.createLoan(screenTracking, id, request.id);
      await this.applicationService.generateRIC(screenTracking, id, request);
      await this.applicationService.connectUserConsentsToPM(
        screenTracking,
        id,
        request.id,
      );

      this.logger.log(
        'Response status 201',
        `${ApplicationController.name}#finalize`,
        request.id,
      );
    } catch (error) {
      this.logger.error(
        'Error',
        `${ApplicationController.name}#finalize`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Post('parsePdf')
  async parsePdf(
    @Body() body: { html: string; screenId: string },
    @Req() request: Request,
  ) {
    // get a html
    const screenId = body.screenId;
    const fileName = screenId + '.pdf';

    const lambdaPayload = {
      loan_id: 'patria',
      html_content: body.html,
      filename: fileName,
    };

    this.logger.log(
      JSON.stringify(lambdaPayload, null, 4),
      'parsePdf#lambdaPayload',
      request.id,
    );
    const response = await lambda
      .invoke({
        FunctionName: 'getpdf-staging',
        InvocationType: 'RequestResponse',
        Payload: JSON.stringify(lambdaPayload),
        LogType: 'Tail',
      })
      .promise();

    const responseData = JSON.parse(response.Payload.toString());

    this.logger.log(
      JSON.stringify(responseData, null, 4),
      'parsePdf#responseData',
      request.id,
    );

    if (responseData.statusCode != 200) throw new Error('Something Went Wrong');

    const bodyResponse = JSON.parse(responseData.body.toString());

    this.logger.log(
      JSON.stringify(
        {
          pdf: bodyResponse.Key,
        },
        null,
        4,
      ),
      'parsePdf#Api response',
      request.id,
    );
    return {
      pdf: bodyResponse.Key,
    };
  }

  @Get('getPdf')
  async getPdf(@Res() res: Response, @Query('name') name: string) {
    const params = {
      Bucket: bucketS3,
      Key: name,
    };

    s3.getObject(params, function (err, data) {
      if (err) {
        return {
          success: false,
          error: err,
        };
      } else {
        const stream = s3.getObject(params).createReadStream().pipe(res);
      }
    });
  }

  // @UseGuards(JwtAuthGuard)
  @Post('init-schedule')
  async initPaymentSchedule(
    @Body() payload: { screenTracking: string; id: string },
  ) {
    try {
      const { screenTracking, id } = payload;
      return await this.applicationService.initLoanSchedule(
        screenTracking,
        id,
        'request.id',
      );
    } catch (error) {
      this.logger.error(
        'Error',
        `${ApplicationController.name}#initPaymentSchedule`,
        ' request.id',
        error,
      );
      throw error;
    }
  }

  // @UseGuards(JwtAuthGuard)
  @Post('test/amortization')
  async testAmortization(
    @Body()
    payload: {
      apr: number;
      weeklyPayment: number;
      term: number;
      financedAmount: number;
      loanStartDate: string;
    },
  ) {
    try {
      if (process.env.NODE_ENV === 'production') {
        throw new ForbiddenException();
      }
      const { apr, weeklyPayment, term, financedAmount, loanStartDate } =
        payload;

      const testOffer = {
        apr: apr,
        monthlyPayment: weeklyPayment,
        term: term,
        financedAmount: financedAmount,
        loanStartDate: moment(loanStartDate).toDate(),
      };
      return await this.applicationService.createTestSchedule(testOffer);
    } catch (error) {
      this.logger.error(
        'Error',
        `${ApplicationController.name}#testAmortization`,
        ' request.id',
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('contract')
  @UsePipes(new ValidationPipe())
  async getContractData(@Req() request: Request) {
    const screenTrackingId = request.user.screenTracking;

    try {
      const response = await this.applicationService.getPromissoryNoteData2(
        screenTrackingId,
        request,
      );
      this.logger.log(
        'Response status 200',
        `${ApplicationController.name}#getContractData`,
        request.id,
        response,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#getContractData`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('efta')
  @UsePipes(new ValidationPipe())
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
        `${ApplicationController.name}#generateEFTA`,
        request.id,
      );

      return { documentId: response };
    } catch (error) {
      this.logger.error(
        'Error',
        `${ApplicationController.name}#generateEFTA`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('skipAutoPay')
  @HttpCode(204)
  async setupAutoPayLater(@Req() request: Request) {
    const { screenTracking } = request.user;
    try {
      const response = await this.applicationService.setupAutoPayLater(
        screenTracking,
        request.id,
      );

      this.logger.log(
        'Response status 204',
        `${ApplicationController.name}#setupAutoPayLater`,
        request.id,
      );

      return { documentId: response };
    } catch (error) {
      this.logger.error(
        'Error',
        `${ApplicationController.name}#setupAutoPayLater`,
        request.id,
        error,
      );
      throw error;
    }
  }

  @Patch('user/cards')
  @UsePipes(new ValidationPipe())
  async updateLoanPaymentProCard(
    @Body() CardsDto: CardsDto,
    @Req() request: Request,
  ) {
    try {
      const paymentMethodToken = CardsDto.paymentMethodToken;
      const paymentId = CardsDto.paymentId;

      await this.loanPaymentProService.updateCard(paymentId, request.id);
    } catch (error) {
      this.logger.error(
        'Error:',
        `${ApplicationController.name}#updateLoanPaymentProCard`,
        request.id,
        error,
      );
      throw error;
    }
  }
}
