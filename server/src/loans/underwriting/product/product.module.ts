import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductRules, ProductRulesSchema } from './product-rules.schema';
import { ProductService } from './product.service';
import ProductConfig from './product.config';
import { LoggerService } from '../../../logger/logger.service';
import { AppService } from '../../../app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [ProductConfig] }),
    MongooseModule.forFeature([
      { name: ProductRules.name, schema: ProductRulesSchema },
    ]),
  ],
  exports: [MongooseModule],
  providers: [ProductService, AppService, LoggerService],
})
export class ProductModule {}
