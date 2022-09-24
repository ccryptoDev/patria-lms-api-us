import { Module } from '@nestjs/common';
import { NunjucksCompilerService } from './nunjucks-compiler.service';

@Module({
  providers: [NunjucksCompilerService],
  exports: [NunjucksCompilerService],
})
export class NunjucksCompilerModule {}
