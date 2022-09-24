import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './s3.service';

import s3Config from './s3.config';
import { LoggerService } from '../logger/logger.service';
import { S3Controller } from './s3.controller';
import { AppService } from '../app.service';
import { AppModule } from '../app.module';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [s3Config] }),
    forwardRef(() => AppModule),
  ],
  providers: [S3Service, AppService, LoggerService],
  controllers: [S3Controller],
})
export class S3Module {}
