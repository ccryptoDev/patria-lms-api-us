import { Controller, Get, UseGuards } from '@nestjs/common';
import { LoggerService } from '../../logger/logger.service';

import { JwtAuthGuard } from '../../user/auth/jwt-auth.guard';
import { EventsService } from './events.service';

@UseGuards(JwtAuthGuard)
@Controller('/api/events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly logger: LoggerService,
  ) {}

  @Get('test')
  async sendExampleEvent() {
    try {
      const response = await this.eventsService.sendExampleEvent();

      this.logger.log(
        'Response status 200:',
        `${EventsController.name}#sendEventsExample`,
      );

      return response;
    } catch (error) {
      this.logger.error(
        'Error:',
        `${EventsController.name}#sendEventsExample`,
        error,
      );
      throw error;
    }
  }
}
