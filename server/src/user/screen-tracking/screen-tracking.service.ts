import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from './screen-tracking.schema';
import { Model } from 'mongoose';

@Injectable()
export class ScreenTrackingService {
  constructor(
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
  ) {}

  async setCompleted(userId: string): Promise<ScreenTrackingDocument | null> {
    const completedScreenTracking = await this.screenTrackingModel.findOneAndUpdate(
      { user: userId },
      { isCompleted: true, lastLevel: 8, lastlevel: 8 },
      { new: true },
    );

    return completedScreenTracking;
  }
}
