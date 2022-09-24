import { Injectable } from '@nestjs/common';
import {
  ScreenTracking,
  ScreenTrackingDocument,
} from '../screen-tracking/screen-tracking.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { ClarityResponse, ClarityDocument } from './clarity.schema';

@Injectable()
export class ClarityService {
  constructor(
    @InjectModel(ScreenTracking.name)
    private readonly screenTrackingModel: Model<ScreenTrackingDocument>,
    @InjectModel(ClarityResponse.name)
    private readonly clarityModel: Model<ClarityDocument>,
  ) { }

  async getClarityInquiry(request: Request, data: any) {
    const { screenTrackingId } = data;
    const clarityData = await this.clarityModel.find({
      screenTracking: screenTrackingId,
    });
    return clarityData;
  }
}
