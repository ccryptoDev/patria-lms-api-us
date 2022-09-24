import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { LoggerService } from '../../../logger/logger.service';
import { ApplicationLink, ApplicationLinkSchema } from './link.schema';
import { ApplicationLinkService } from './link.service';
import { LinkController } from './link.controller';
import linkEnvConfig from './link.config';
import { PracticeManagementModule } from '../../../loans/practice-management/practice-management.module';
import { AppModule } from '../../../app.module';
import { AppService } from '../../../app.service';
import { MandrillService } from '../../../mandrill/mandrill.service';
import { TwilioModule } from '../../../twilio/twilio.module';
import { TwilioService } from '../../../twilio/twilio.service';
import { MandrillModule } from '../../../mandrill/mandrill.module';
import { NunjucksCompilerModule } from '../../../nunjucks-compiler/nunjucks-compiler.module';
import { NunjucksCompilerService } from '../../../nunjucks-compiler/nunjucks-compiler.service';
import { LogActivityModule } from '../../../user/log-activity/log-activity.module';
import { LogActivityService } from '../../../user/log-activity/log-activity.service';
import { CountersModule } from '../../../counters/counters.module';
import { CountersService } from '../../../counters/counters.service';
import { DatabaseSearchModule } from '../../../database-search/database-search.module';

@Module({
  imports: [
    DatabaseSearchModule,
    ConfigModule.forRoot({ load: [linkEnvConfig] }),
    CountersModule,
    LogActivityModule,
    MongooseModule.forFeature([
      { name: ApplicationLink.name, schema: ApplicationLinkSchema },
    ]),
    PracticeManagementModule,
    forwardRef(() => AppModule),
    MandrillModule,
    TwilioModule,
    NunjucksCompilerModule,
    ConfigModule,
  ],
  exports: [MongooseModule],
  providers: [
    ApplicationLinkService,
    CountersService,
    LogActivityService,
    MandrillService,
    TwilioService,
    NunjucksCompilerService,
    AppService,
    LoggerService,
  ],
  controllers: [LinkController],
})
export class LinkModule {}
