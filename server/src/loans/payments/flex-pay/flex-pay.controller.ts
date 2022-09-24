import { Controller } from '@nestjs/common';
import { FlexPayService } from './flex-pay.service';

@Controller('flexpay')
export class FlexPayController {
  constructor(private readonly carmelService: FlexPayService) { }
}
