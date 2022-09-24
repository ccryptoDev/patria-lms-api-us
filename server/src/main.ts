import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
// import { json } from 'express';
import bodyParser from 'body-parser';
import { join } from 'path';
import helmet from 'helmet';

import nunjucks from 'nunjucks';

import { AppModule } from './app.module';
import config from './app.config';

// Add JWT properties to request.user object
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from 'express';
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    export interface User {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      screenTracking: string;
      role: string;
    }
  }
}

async function bootstrap() {
  // set up nunjucks
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const express = app.getHttpAdapter().getInstance();
  const views = join(__dirname, '../views');
  nunjucks.configure(views, { express, autoescape: false, noCache: true });
  app.setBaseViewsDir(views);
  app.setViewEngine('njk');

  app.enableCors();
  // app.use(json({ limit: '20mb' }));
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(helmet());
  const { port } = config();
  await app.listen(port);
}
bootstrap();
