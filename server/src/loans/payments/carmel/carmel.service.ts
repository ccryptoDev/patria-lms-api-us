import axios, { AxiosRequestConfig } from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../../logger/logger.service';
import {
  ApiResource,
  ICreatePaymentOrderPayload,
  IOriginationAccount,
  IPaymentData,
} from './interfaces';
import { PaymentOrderDto } from './dto/payment-order.dto';
import { Resources } from './enums';
import { Method } from 'axios';
import { ClientCredentials } from 'simple-oauth2';
import { LogInputOutput } from '../../../utils/decorators/log-input-output.decorator';

@Injectable()
export class CarmelService {
  private oauth2Client: ClientCredentials;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly paymentOrderDto: PaymentOrderDto,
  ) {}

  private getOauth2Client(): ClientCredentials {
    if (!this.oauth2Client) {
      // const config = {
      //   client: {
      //     id: this.configService.get<string>('clientId'),
      //     secret: this.configService.get<string>('clientSecret'),
      //   },
      //   auth: {
      //     tokenHost: this.configService.get<string>('authHost'),
      //     tokenPath: this.configService.get<string>('authPath'),
      //   },
      // };
      // console.log({ config });
      const config = {
        client: {
          id: '21o5so66fuvqmnif02dbortspe',
          secret: '23cujv6ta7k14s2akcmohmea45r2f08vo5ec51jc2v0aeoujjbr',
        },
        auth: {
          tokenHost: 'https://auth.carmelsolutions.com',
          tokenPath: '/oauth2/token',
        },
      };

      this.oauth2Client = new ClientCredentials(config);
    }

    return this.oauth2Client;
  }

  private getApiResource(resourceName: Resources): ApiResource<any, any> {
    const resources = {
      [Resources.CREATE_PAYMENT_ORDER]: {
        path: '/payment-orders',
        method: 'POST',
        parser: this.paymentOrderDto.exec,
      },
      [Resources.GET_ORIGINATION_ACCOUNT_ID]: {
        path: '/payment-orders',
        method: 'GET',
      },
    };

    const resource = resources[resourceName];

    if (!resource) {
      throw new Error(`Resource ${resourceName} not found`);
    }

    return resource;
  }

  private async makeRequest<ResourceInput = undefined, ResourceOutput = void>(
    resource: ApiResource<ResourceInput, ResourceOutput>,
    data?: Record<string, unknown>,
  ): Promise<ResourceOutput> {
    const config: AxiosRequestConfig = {
      method: resource.method as Method,
      url: this.configService.get<string>('baseUrl').concat(resource.path),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.getOauthToken()}`,
      },
    };

    if (resource.parser) {
      config.data = resource.parser(data as ResourceInput);
    }

    return axios(config).then((response) => response.data as ResourceOutput);
  }

  async getOauthToken(): Promise<string> {
    const client = this.getOauth2Client();

    const accessToken = await client.getToken({
      scope: 'https://api.carmelsolutions.com/pay',
    });

    return accessToken?.token?.access_token;
  }

  @LogInputOutput()
  async createPaymentOrder(
    requestId: string,
    createPaymentOrderDto: Record<string, any>,
  ): Promise<any> { // ICreatePaymentOrderPayload
    const originationAccountId = await this.getOriginationAccountId(requestId);

    return this.makeRequest<IPaymentData, ICreatePaymentOrderPayload>(
      this.getApiResource(Resources.CREATE_PAYMENT_ORDER),
      {
        createPaymentOrderDto,
        requestId,
        originationAccountId,
      },
    );
  }

  @LogInputOutput()
  async getOriginationAccountId(requestId: string): Promise<string> {
    return Promise.resolve('');
    // const originationAccounts = await this.makeRequest<
    //   undefined,
    //   IOriginationAccount[]
    // >(this.getApiResource(Resources.GET_ORIGINATION_ACCOUNT_ID));

    // console.log({ originationAccounts });

    // // how do we select which origination account id to use?
    // return originationAccounts[0]?.id || 'default';
  }
}
