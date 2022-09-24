import { Injectable } from '@nestjs/common';
import moment from 'moment';
import { LogInputOutput } from '../../../../utils/decorators/log-input-output.decorator';
import { ICreatePaymentOrderPayload, IPaymentData } from '../interfaces';

@Injectable()
export class PaymentOrderDto {
  @LogInputOutput()
  exec({
    createPaymentOrderDto,
    transactionId,
    originationAccountId,
  }: IPaymentData): ICreatePaymentOrderPayload {
    return {
      paymentOrder: {
        amount: createPaymentOrderDto.amount,
        dateCreated: moment().format('YYYY-MM-DDTHH:mm:ss.Z'),
        direction: 'debit',
        effectiveDate: '2021-05-27', // ??
        id: transactionId,
        originationAccountId,
        receivingAccount: {
          accountNumber: createPaymentOrderDto.accountNumber,
          name: createPaymentOrderDto.name,
          routingNumber: createPaymentOrderDto.routingNumber,
          type: 'checking',
        },
        status: 'approvalRequired',
        subType: 'WEB', // ??
        type: createPaymentOrderDto.paymentMethodType,
      },
    };
  }
}
