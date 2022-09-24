import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Agreement, AgreementSchema } from './agreement.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Agreement.name, schema: AgreementSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class AgreementModule {}
