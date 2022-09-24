import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import history from 'connect-history-api-fallback';
import { MongooseModule } from '@nestjs/mongoose';

import appEnvConfig from './app.config';
import { TwilioModule } from './twilio/twilio.module';
import { MandrillModule } from './mandrill/mandrill.module';
import { LoggerModule } from './logger/logger.module';
import { S3Module } from './s3/s3.module';
import { RequestLoggerService } from './logger/request-logger/request-logger.service';
import { UserModule } from './user/user.module';
import { LoansModule } from './loans/loans.module';
import { CountersModule } from './counters/counters.module';
import { PuppeteerModule } from './puppeteer/puppeteer.module';
import { AppService } from './app.service';
import { NunjucksCompilerModule } from './nunjucks-compiler/nunjucks-compiler.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseSearchModule } from './database-search/database-search.module';
import { EventsModule } from './communication/events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [appEnvConfig], isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '../../client/dist'),
      exclude: ['/api*'],
    }),
    MongooseModule.forRoot('mongodb://localhost:27017/patria', {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    }),
    ScheduleModule.forRoot(),
    CountersModule,
    LoansModule,
    LoggerModule,
    MandrillModule,
    NunjucksCompilerModule,
    PuppeteerModule,
    S3Module,
    TwilioModule,
    UserModule,
    DatabaseSearchModule,
    EventsModule,
  ],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(history()).exclude('/api(.*)');
    consumer.apply(RequestLoggerService).forRoutes('*');
  }
}
