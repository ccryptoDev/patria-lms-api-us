import { Injectable } from '@nestjs/common';
import { ManagedUpload } from 'aws-sdk/clients/s3';

@Injectable()
export class S3MockService {
  constructor() {}

  async uploadFile(
    path: string,
    body: Buffer,
    contentType: string,
    requestId: string,
  ) {
    return Promise.resolve({
      // s3 responseType
      Location: '/some/lodation/fc0d87a5cf50ad78',
      Key: 'cadf99',
    } as ManagedUpload.SendData);
  }

  getS3Url(path: string) {
    return `base/s3asset/${path}`;
  }
}
