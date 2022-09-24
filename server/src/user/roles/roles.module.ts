import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Roles, RolesSchema } from './roles.schema';
import { RolesController } from './roles.controller';
import { AppService } from '../../app.service';
import { LoggerService } from '../../logger/logger.service';
import { RolesService } from './roles.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Roles.name, schema: RolesSchema }]),
  ],
  providers: [AppService, LoggerService, RolesService],
  exports: [MongooseModule],
  controllers: [RolesController],
})
export class RolesModule {}
