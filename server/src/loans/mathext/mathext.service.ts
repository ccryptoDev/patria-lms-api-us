import { Injectable } from '@nestjs/common';
import moment from 'moment';

import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class MathExtService {
  constructor(private readonly logger: LoggerService) { }

  makeAmortizationSchedule(
    _principal: number,
    _payment: number,
    _interestRate: number,
    _term: number,
    requestId: string,
    _loanStartDate?: Date,
    _firstPaymentDate?: Date,
  ): {
    payment: number;
    interestPaid: number;
    principalPaid: number;
    schedule: {
      id: number;
      payment: number;
      interest: number;
      principal: number;
      startBalance: number;
      endBalance: number;
    }[];
  } {
    const maxAttempts = 100;
    let attempt = 0;

    const amortize = (
      principal: number,
      payment: number,
      interestRate: number,
      term: number,
      loanStartDate: Date,
      firstPaymentDate: Date,
    ) => {
      ++attempt;
      let principalBalance = 0 + principal;
      let interestPaid = 0;
      let principalPaid = 0;
      let firstScheduleAccruedInterest = 0;

      const rate = this.float(interestRate / 100 / 52, 9);

      // accrued interest
      const accruedInterestDays = moment(firstPaymentDate)
        .startOf('day')
        .diff(moment(loanStartDate).startOf('day'), 'days');

      firstScheduleAccruedInterest = this.float(
        this.float(this.float(principal * rate, 9) / 7, 9) *
        accruedInterestDays,
        7,
      );

      const schedule = [];
      for (let month = 1; month <= term; ++month) {
        let interestPmt = this.float(principalBalance * rate, 9);
        const interestPmtOverRun = this.float(interestPmt, 9);

        if (month == 1) {
          interestPmt = firstScheduleAccruedInterest;
        }
        let principalPmt = this.float(
          principalBalance > payment ? payment - interestPmt : principalBalance,
          7,
        );

        if (month == 1) {
          principalPmt = this.float(payment - interestPmtOverRun, 9);
          payment = this.float(interestPmt + principalPmt, 9);
        }

        if (this.float(principalPmt + interestPmt) > payment) {
          interestPmt = this.float(
            interestPmt - (principalPmt + interestPmt - payment),
            7,
          );
        }

        const balance = this.float(principalBalance - principalPmt, 9);
        interestPaid = this.float(interestPaid + interestPmt, 9);
        principalPaid = this.float(principalPaid + principalPmt);
        const pmt = {
          id: month,
          payment: this.float(principalPmt + interestPmt, 2),
          interest: this.float(interestPmt, 2),
          principal: this.float(principalPmt, 2),
          startBalance: this.float(principalBalance, 2),
          endBalance: this.float(balance, 2),
        };
        schedule.push(pmt);
        payment = _payment;
        principalBalance = balance;
      }

      //   if (principalBalance !== 0 && attempt <= maxAttempts) {
      //     const adjustedPayment = this.float(payment + 0.01);
      //     this.logger.log(
      //       ` balance: ${principalBalance}  adjustedPayment: ${adjustedPayment}`,
      //       `${MathExtService.name}#amortize`,
      //       requestId,
      //     );

      //     return amortize(
      //       principal,
      //       adjustedPayment,
      //       interestRate,
      //       term,
      //       loanStartDate,
      //       firstPaymentDate,
      //     );
      //   }

      return {
        payment,
        interestPaid,
        principalPaid,
        schedule,
      };
    };
    return amortize(
      _principal,
      _payment,
      _interestRate,
      _term,
      _loanStartDate,
      _firstPaymentDate,
    );
  }

  /**
   * float
   * @param number number
   * @param precision default to 2 decimal places
   */
  float(number: number, precision = 2) {
    return parseFloat(parseFloat('' + number).toFixed(precision));
  }

  toFixed(number: number, precision: number) {
    return parseFloat(number.toFixed(precision));
  }
}
