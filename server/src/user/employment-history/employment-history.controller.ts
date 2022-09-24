import { Controller } from '@nestjs/common';
import { EmploymentHistoryService } from './employment-history.service';

@Controller('employment-history')
export class EmploymentHistoryController {
  constructor(private readonly employmentHistoryService: EmploymentHistoryService) {}
}
