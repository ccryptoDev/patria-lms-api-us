import { Controller } from '@nestjs/common';
import { CarmelService } from './carmel.service';

@Controller('carmel')
export class CarmelController {
  constructor(private readonly carmelService: CarmelService) {}
}
