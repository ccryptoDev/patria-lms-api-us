import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

import { secret } from './auth.config';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './local.strategy';
import { UserModule } from '../../user/user.module';
import { LoggerService } from '../../logger/logger.service';
import { ScreenTrackingModule } from '../../user/screen-tracking/screen-tracking.module';
import { AdminModule } from '../admin/admin.module';
import { AdminLocalStrategy } from './admin-local-strategy';
import { MandrillModule } from '../../mandrill/mandrill.module';
import { NunjucksCompilerModule } from '../../nunjucks-compiler/nunjucks-compiler.module';
import { AppService } from '../../app.service';
import { LogActivityModule } from '../log-activity/log-activity.module';
import { LogActivityService } from '../log-activity/log-activity.service';
import { CountersModule } from '../../counters/counters.module';
import { DatabaseSearchModule } from '../../database-search/database-search.module';

@Module({
  imports: [
    JwtModule.register({
      secret,
      signOptions: { expiresIn: '1d' },
    }),
    AdminModule,
    DatabaseSearchModule,
    CountersModule,
    LogActivityModule,
    MandrillModule,
    NunjucksCompilerModule,
    ScreenTrackingModule,
    forwardRef(() => UserModule),
  ],
  providers: [
    AuthService,
    AppService,
    LocalStrategy,
    LogActivityService,
    AdminLocalStrategy,
    JwtStrategy,
    LoggerService,
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
