import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScreenTracking, ScreenTrackingSchema } from './screen-tracking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ScreenTracking.name, schema: ScreenTrackingSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class ScreenTrackingModule {}
