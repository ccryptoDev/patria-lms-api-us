import { Injectable } from '@nestjs/common';

@Injectable()
export class PuppeteerMockService {
  constructor() {}

  async generatePDF(
    html: string,
    filePath: string,
    requestId: string,
  ): Promise<void> {
    return undefined;
  }
}
