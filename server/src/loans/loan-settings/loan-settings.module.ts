import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoanSettings, LoanSettingsSchema } from './loan-settings.schema';
import { LoanSettingsService } from './loan-settings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LoanSettings.name, schema: LoanSettingsSchema },
    ]),
  ],
  providers: [LoanSettingsService],
  exports: [MongooseModule, LoanSettingsService],
})
export class LoanSettingsModule {}
