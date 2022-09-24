import { Module } from '@nestjs/common';

import { PaymentsModule } from './payments/payments.module';
import { UnderwritingModule } from './underwriting/underwriting.module';
import { PracticeManagementModule } from './practice-management/practice-management.module';
import { AgreementModule } from './agreement/agreement.module';
import { MathExtModule } from './mathext/mathext.module';
import { InterestRateModule } from './interest-rate/interest-rate.module';
import { AdminDashboardModule } from './admin-dashboard/admin-dashboard.module';
import { LedgerModule } from './ledger/ledger.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [
    AdminDashboardModule,
    AgreementModule,
    InterestRateModule,
    LedgerModule,
    MathExtModule,
    PaymentsModule,
    PracticeManagementModule,
    UnderwritingModule,
    CommentsModule,
  ],
})
export class LoansModule {}
