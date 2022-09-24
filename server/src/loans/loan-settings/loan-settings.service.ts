import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { LoanSettings, LoanSettingsDocument } from './loan-settings.schema';
import { Model } from 'mongoose';

@Injectable()
export class LoanSettingsService {
  constructor(
    @InjectModel(LoanSettings.name)
    private readonly loanSettingsModel: Model<LoanSettingsDocument>,
  ) {}

  async getLoanSettings(): Promise<LoanSettingsDocument | null> {
    const LoanSettings = await this.loanSettingsModel.findOne({});
    return LoanSettings;
  }

  async updateLateFee(lateFee: number): Promise<LoanSettingsDocument | null> {
    const updatedLoanSettings = await this.loanSettingsModel.findOneAndUpdate(
      {},
      { lateFee: lateFee },
    );
    return updatedLoanSettings;
  }

  async updateNSFFee(NSFFee: number): Promise<LoanSettingsDocument | null> {
    const updatedLoanSettings = await this.loanSettingsModel.findOneAndUpdate(
      {},
      { nsfFee: NSFFee },
    );
    return updatedLoanSettings;
  }

  async updateLateFeeGracePeriod(
    lateFeeGracePeriod: number,
  ): Promise<LoanSettingsDocument | null> {
    const updatedLoanSettings = await this.loanSettingsModel.findOneAndUpdate(
      {},
      { lateFeeGracePeriod: lateFeeGracePeriod },
    );
    return updatedLoanSettings;
  }

  async updateDelinquencyPeriod(
    delinquencyPeriod: number,
  ): Promise<LoanSettingsDocument | null> {
    const updatedLoanSettings = await this.loanSettingsModel.findOneAndUpdate(
      {},
      { delinquencyPeriod: delinquencyPeriod },
    );

    return updatedLoanSettings;
  }

  async updateEventsUrl(
    eventsUrl: string,
  ): Promise<LoanSettingsDocument | null> {
    const updatedLoanSettings = await this.loanSettingsModel.findOneAndUpdate(
      {},
      { eventsUrl: eventsUrl },
    );
    return updatedLoanSettings;
  }

  async updateEventsAuthToken(
    eventsAuthToken: string,
  ): Promise<LoanSettingsDocument | null> {
    const updatedLoanSettings = await this.loanSettingsModel.findOneAndUpdate(
      {},
      { eventsAuthToken: eventsAuthToken },
    );

    return updatedLoanSettings;
  }

  async updateSettingsData(
    lateFee: number,
    NSFFee: number,
    lateFeeGracePeriod: number,
    delinquencyPeriod: number,
    eventsUrl: string,
    eventsAuthToken: string,
  ): Promise<LoanSettingsDocument | null> {
    const updatedLoanSettings = await this.loanSettingsModel.create({
      lateFee: lateFee,
      nsfFee: NSFFee,
      lateFeeGracePeriod: lateFeeGracePeriod,
      delinquencyPeriod: delinquencyPeriod,
      eventsUrl: eventsUrl,
      eventsAuthToken: eventsAuthToken,
    });

    return updatedLoanSettings;
  }
}
