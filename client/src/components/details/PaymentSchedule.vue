<template>
  <div>
    <div>
      <h3 style="margin: 10px 0 10px 10px; font-weight: bold">Payment</h3>
    </div>
    <div>
      <table>
        <tbody>
          <tr v-if="isInRepayment || isPaid">
            <th>Financing Start Date</th>
            <td>
              <strong>{{ paymentManagement.loanStartDate | date }}</strong>
            </td>
          </tr>
          <tr v-if="isInRepayment || isPaid">
            <th>Requested Loan Amount</th>
            <td>{{ paymentManagement.principalAmount | currency }}</td>
          </tr>
          <tr v-if="isInRepayment || isPaid">
            <th>Financing Amount</th>
            <td>
              {{
              paymentManagement.screenTracking.selectedOffer.financedAmount
              | currency
              }}
            </td>
          </tr>
          <tr v-if="isInRepayment || isPaid">
            <th>Payoff Amount</th>
            <td>{{ paymentManagement.payOffAmount | currency }}</td>
          </tr>
          <tr v-if="isInRepayment || isPaid">
            <th>APR</th>
            <td>{{ paymentManagement.apr }}%</td>
          </tr>
          <tr v-if="isInRepayment || isPaid">
            <th>Original Financing Term</th>
            <td>
              {{ paymentManagement.initialPaymentSchedule.length }} weeks
            </td>
          </tr>
          <!-- <tr v-if="isInRepayment || isPaid">
            <th>Remaining Financing Term</th>
            <td>
              {{ paymentManagement.initialPaymentSchedule.length }} weeks
            </td>
          </tr> -->
          <!-- <tr v-if="(paymentManagement.promoTermCount && isInRepayment) || isPaid">
            <th>Promo Term</th>
            <td>
              {{ paymentManagement.promoTermCount }}
            </td>
          </tr> -->
          <tr>
            <th>Financing Status</th>
            <td>
              {{ (paymentManagement.status) | capitalize }}
            </td>
          </tr>
          <!-- <tr v-if="(paymentManagement.promoStatus && isInRepayment) || isPaid">
            <th>Promo Status</th>
            <td>
              {{ paymentManagement.promoStatus | capitalize }}
            </td>
          </tr> -->
          <tr v-if="isInRepayment || isPaid">
            <th>Delinquent Amount</th>
            <td>
              <ul>
                Unpaid Interest Balance: {{ ledger.unpaidInterestBalance + ledger.cycleAccruedInterest | currency }}
              </ul>
              <ul>
                Unpaid Fees Balance: {{ ledger.accruedFeesBalance | currency }}
              </ul>
              <ul>
                Unpaid Principal Balance: {{ ledger.unpaidPrincipalBalance | currency }}
              </ul>

              <ul>
                <b>Total: </b> {{ ledger.delinquentAmount | currency }}
              </ul>
            </td>
          </tr>
          <tr v-if="isInRepayment || isPaid">
            <th>Maturity Date</th>
            <td>
              {{ paymentManagement.maturityDate | date }}
            </td>
          </tr>

          <tr v-if="isInRepayment || isPaid">
            <th>Next Payment Schedule Date</th>
            <td style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              ">
              {{ paymentManagement.nextPaymentSchedule | date }}
              <b-form-checkbox v-if="isInRepayment" @change="toggleAutopay"
                v-model="paymentManagement.canRunAutomaticPayment" name="autopay-switch" switch size="lg">
                <span v-if="paymentManagement.canRunAutomaticPayment" style="color: #ea4c89">
                  AutoPay: On
                </span>
                <span v-else style="color: #ea4c89"> AutoPay: Off </span>
              </b-form-checkbox>
            </td>
          </tr>
          <!-- <tr v-if="isInRepayment || isPaid">
            <th>Minimum payment amount</th>
            <td>
              {{ paymentManagement.minimumPaymentAmount | currency }}
            </td>
          </tr> -->
          <tr v-if="isInRepayment || isPaid">
            <th>Current payment amount</th>
            <td style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              ">
              <span>{{
                paymentManagement.currentPaymentAmount | currency
                }}</span>
              <ChangePaymentAmount v-if="
                isInRepayment &&
                (userData.role === adminRoles.UserServicing ||
                  userData.role === adminRoles.SuperAdmin)
              " :screenTrackingId="screenTrackingId" :regularAmount="paymentManagement.minimumPaymentAmount"
                :promoAmount="paymentManagement.promoPaymentAmount"
                :currentAmount="paymentManagement.currentPaymentAmount" :payoffAmount="paymentManagement.payOffAmount"
                @reloadPage="reloadPage" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="isInRepayment" style="
        text-align: right;
        justify-content: space-between;
        align-items: center;
        margin: 8px 0px;
      ">
      <h3></h3>

      <!-- <div class="tooltipvue">
        <button v-tooltip="'You have new messages.'" v-if="this.collectionCheck != ''" class="primary"
          style="margin-right: 10px; background-color: #ea4c89; color: white" @click="movetocollections(email, 'in')">
          Move to collections
        </button>
        <span class="tooltiptextvue">Can move loan to collections</span>
      </div> -->

      <div class="tooltipvue">
        <button v-if="
          this.paymentManagement.collectionAssignStatus &&
          this.paymentManagement.collectionAssignStatus != ''
        " class="primary" style="margin-right: 10px; background-color: #ea4c89; color: white"
          @click="movetocollections(email, 'out')">
          Move out of collections
        </button>
        <span class="tooltiptextvue">Can move loan out of collections</span>
      </div>

      <div class="tooltipvue">
        <button class="primary" style="margin-right: 10px; background-color: #ea4c89; color: white"
          @click="forgiveLateFee()">
          Forgive Late Fee
        </button>
        <span class="tooltiptextvue">Forgive late fee</span>
      </div>

      <div class="tooltipvue">
        <button class="primary" style="margin-right: 10px; background-color: #ea4c89; color: white"
          @click="forgiveNsfFee()">
          Forgive NSF Fee
        </button>
        <span class="tooltiptextvue">Forgive NSF Fee</span>
      </div>

      <!-- <div class="tooltipvue">
        <button class="primary" style="margin-right: 10px; background-color: #ea4c89; color: white"
          @click="deferPayment()">
          Defer Payment
        </button>
        <span class="tooltiptextvue">Can Defer upcoming scheduled payment</span>
      </div> -->

      <!-- <div class="tooltipvueleft">
        <button class="primary" style="margin-right: 10px; background-color: #ea4c89; color: white"
          @click="closeLoan(email)">
          Close loan
        </button>
        <span class="tooltiptextleft">Can Close the loan</span>
      </div> -->

    </div>
    <div v-if="isInRepayment" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 8px 0px;
      ">
      <h3></h3>
      <!-- Disabled for now, waiting for LPP disbursement integration. -->
      <!-- <button class="primary" style="margin-right: 10px; background-color: #ea4c89; color: white;" @click="partialReturn(email)">
        Partial Return
      </button> -->
    </div>
    <div v-if="isInRepayment" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 8px 0px;
      ">
      <h3>Payment Schedule Information</h3>
      <!-- <div class="summary-row large-padding">
        <b-form-checkbox @change="turnOnPromo" v-model="promoCheck" name="promo-switch" switch size="lg">
          <span v-if="promoStatus" style="color:#ea4c89;">
            Promo On

          </span>
          <span v-else style="color:#ea4c89;">
            Promo Off

          </span>
        </b-form-checkbox>
      </div> -->
      <!-- <div class="tooltipvue">
        <button class="primary" style="margin-right: 0px; background-color: #ea4c89; color: white"
          @click="forgivePayment()">
          Waive Payment
        </button>
        <span class="tooltiptextvue">Can Waive upcoming scheduled payment</span>
      </div> -->

      <!-- <AmendPaymentButton :screenTrackingId="screenTrackingId" v-if="
        isInRepayment &&
        (userData.role === adminRoles.UserServicing ||
          userData.role === adminRoles.SuperAdmin)
      " @reloadPage="reloadPage" /> -->
      <MakePaymentButton :screenTrackingId="screenTrackingId" v-if="
        isInRepayment &&
        (userData.role === adminRoles.UserServicing ||
          userData.role === adminRoles.SuperAdmin)
      " @reloadPage="reloadPage" />
    </div>
    <div v-if="isInRepayment">
      <table>
        <thead>
          <tr>
            <th style="width: 10px">#</th>
            <th>Schedule Date</th>
            <th>Amount</th>
            <!-- <th>Unpaid Principal Balance</th>
            // <th>Principal</th>
            // <th>Interest</th> -->
            <th>Late Fee</th>
            <th>NSF Fee</th>
            <th
              v-if="
                this.userData.role === 'Manager - LA' ||
                this.userData.role === 'Super Admin' ||
                this.userData.role === 'User - Servicing'
              "
            >
              Forgive NSF Fee
            </th>
            <th
              v-if="
                this.userData.role === 'Manager - LA' ||
                this.userData.role === 'Super Admin' ||
                this.userData.role === 'User - Servicing'
              "
            >
              Forgive Late Fee
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(paymentScheduleItem, index) in paymentScheduleLeft" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ paymentScheduleItem.date | date }}</td>
            <td>{{ paymentScheduleItem.amount | currency }}</td>

            <!-- <td>
              {{ paymentScheduleItem.startPrincipal | currency }}
            </td>
            <td>
              {{ paymentScheduleItem.principal | currency }}
            </td>
            <td>{{ paymentScheduleItem.interest | currency }}</td> -->
            <td>{{ paymentScheduleItem.fees | currency }}</td>
            <td>
              {{
                paymentScheduleItem.nsfFee === undefined
                  ? 0
                  : paymentScheduleItem.nsfFee | currency
              }}
            </td>
            <td
              v-if="
                userData.role === 'Manager - LA' ||
                  userData.role === 'Super Admin' ||
                  userData.role === 'User - Servicing'
              "
            >
              <div class="tooltipvue">
                <button
                  class="primary"
                  style="margin-right: 10px; background-color: #ea4c89; color: white"
                  @click="forgiveSingleNsfFee(paymentScheduleItem)"
                  v-if="
                    paymentScheduleItem.status !== 'failed' &&
                      paymentScheduleItem.nsfFee !== 0 &&
                      paymentScheduleItem.nsfFee !== undefined
                  "
                >
                  Forgive NSF Fee
                </button>
              </div>
            </td>
            <td
              v-if="
                userData.role === 'Manager - LA' ||
                  userData.role === 'Super Admin' ||
                  userData.role === 'User - Servicing'
              "
            >
              <div class="tooltipvue">
                <button
                  class="primary"
                  style="margin-right: 10px; background-color: #ea4c89; color: white"
                  @click="forgiveSingleLateFee(paymentScheduleItem)"
                  v-if="
                    paymentScheduleItem.status !== 'failed' &&
                      paymentScheduleItem.fees !== 0
                  "
                >
                  Forgive Late Fee
                </button>
              </div>
            </td>

          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="isInRepayment || isPaid || isClosed"
      style="margin: 8px 0px; height: 49px; display: flex; align-items: center">
      <h3>Payment Transactions</h3>
      <!-- <div class="summary-row large-padding">
        <b-form-checkbox @change="turnOnPromopay" v-model="promopayCheck" name="promopay-switch" switch size="lg">
          <span v-if="promopayStatus" style="color:#ea4c89;">
            Promo View

          </span>
          <span v-else style="color:#ea4c89;">
            Default View

          </span>
        </b-form-checkbox>
      </div> -->
    </div>
    <div v-if="payments && payments.length >= 1 && promopayStatus == false">
      <table>
        <thead>
          <tr>
            <th style="width: 10px">#</th>
            <th>Date</th>
            <th>Amount</th>
            <!-- <th>Start balance</th> -->
            <th>PMT Reference</th>
            <th>Status</th>
            <th>Payment Type</th>
            <th>Applied to Fees</th>
            <!-- <th>Applied to Interest</th>
            <th>Applied to Principal</th>
            <th>End Principal Balance</th> -->

          </tr>
        </thead>
        <tbody>
          <tr v-for="(payment, index) in payments" :key="payment.paymentId">
            <td>{{ index + 1 }}</td>
            <td>{{ payment.date | date }}</td>
            <td>{{ payment.amount | currency }}</td>
            <!-- <td>{{ payment.startPrincipal | currency }}</td> -->
            <td>{{ payment.paymentReference || '--'}} </td>
            <td v-if="payment.status == 'failed'">
              {{ payment.status }} - {{ payment.transactionMessage }}
            </td>
            <td v-if="payment.isRefund == true">Refunded</td>
            <td v-else-if="payment.status == 'paid'">{{ payment.status }}</td>
            <td>{{ payment.paymentType }}</td>
            <td>{{ payment.paidFees | currency }}</td>
            <!-- <td>
              {{
              (payment.paidInterest + payment.paidPastDueInterest) | currency
              }}
            </td>
            <td>{{ payment.paidPrincipal | currency }}</td>
            <td v-if="payment.isAmended == true">
              {{ (payment.startPrincipal - payment.paidPrincipal) | currency }}
            </td>
            <td v-else>{{ (payment.startPrincipal - payment.paidPrincipal) | currency }}</td> -->
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="promopayStatus == true">
      <table>
        <thead>
          <tr>
            <th style="width: 10px">#</th>
            <th>Start balance</th>
            <th>PMT Reference</th>
            <!-- <th>Status</th>
            <th>Payment Type</th> -->
            <th>Amount</th>
            <th>Applied to Fees</th>
            <th>Applied to Interest1</th>
            <th>Applied to Principal1</th>
            <th>End Principal Balance</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(payment, index) in promoPaymentLeft" :key="index">
            <td>{{ index + 1 }}</td>
            <td>{{ payment.startPrincipal | currency }}</td>
            <td>PMT</td>
            <!-- <td v-if="payment.status == 'failed'">
              {{ payment.status }} - {{ payment.transactionMessage }}
            </td>
            <td v-if="payment.isRefund == true">Refunded</td>
            <td v-else-if="payment.status == 'paid'">{{ payment.status }}</td>
            <td>{{ payment.paymentType }}</td> -->
            <td>{{ payment.amount | currency }}</td>
            <td>{{ payment.paidFees | currency }}</td>
            <td>
              {{
              (payment.interest) | currency
              }}
            </td>
            <td>{{ payment.principal | currency }}</td>
            <td>
              {{ (payment.endPrincipal) | currency }}
            </td>
            <td>{{ payment.date | date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import { adminDashboardRequests } from "@/api/admin-dashboard";
import Vue from "vue";
import MakePaymentButton from "@/components/buttons/MakePaymentButton.vue";
// import AmendPaymentButton from "@/components/buttons/AmendPaymentButton.vue";
import ChangePaymentAmount from "@/components/buttons/ChangePaymentAmount.vue";
import { errorHandler } from "@/api/error-handler";
import { getUserData } from "@/admin-dashboard/authentication/helpers";
import { getAdminRoles } from "@/admin-dashboard/helpers";
import {
  updateCustomerDetails,
  closeLoanDetails,
  partialReturnDetails,
  moveLoanCollections,
} from "@/user-application/authentication/api";
import moment from "moment";
import { number } from "card-validator";
export default Vue.extend({
  components: { MakePaymentButton, ChangePaymentAmount },

  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },

  data() {
    return {
      adminRoles: getAdminRoles(),
      isInRepayment: false,
      isPaid: false,
      isClosed: false,
      paymentManagement: [] as any,
      ledger: [] as any,
      userData: getUserData(),
      applicationData: [] as any,
      email: null as null | string,
      autopayStatus: false,
      loanPeriod: 0,
      collectionCheck: null as null | string,
      promoStatus: false,
      promoCheck: false,
      promopayStatus: false,
      promopayCheck: false,
      amount: "" as number | string,
      amountPromo: "" as number | string,
    };
  },

  async created() {
    try {
      const { data } = await adminDashboardRequests.getApplication(
        this.screenTrackingId
      );
      this.email = data.email;
      const { data: LoanSettings } =
        await adminDashboardRequests.getLoanSettings();
      this.loanPeriod = LoanSettings.delinquencyPeriod;
      if (this.paymentManagement.currentPaymentAmount == this.paymentManagement.promoPaymentAmount) {
        this.promoStatus = true;
        this.promoCheck = true;
      } else {
        this.promoStatus = false;
        this.promoCheck = false;
      }
      this.promopayStatus = false;
      this.promopayCheck = false;
    } catch (error) {
      await this.$swal({
        title: "Alert",
        text: "Error loading loan settings",
        icon: "error",
      });
    }
  },

  computed: {
    amountToNumber(): number {
      if (typeof this.amount === "string") {
        const newAmount = parseFloat(this.amount.replace(/[$,]/g, ""));
        return newAmount;
      }

      return this.amount;
    },
    paymentScheduleLeft(): any[] | undefined {
      if (this.paymentManagement && this.paymentManagement.paymentSchedule) {
        const response = this.paymentManagement.paymentSchedule.filter(
          (scheduleItem: any) => scheduleItem.status === "opened"
        );
        return response;
      }
      return undefined;
    },
    promoPaymentLeft(): any[] | undefined {
      if (this.paymentManagement && this.paymentManagement.initialPaymentSchedule) {
        const response = this.paymentManagement.initialPaymentSchedule.filter(
          (scheduleItem: any) => scheduleItem.status === "opened"
        );
        let i = 0;
        const response1: any[] = [];
        let startPrincipal = 0;
        let endPrincipal = 0;
        const responsePay = this.paymentManagement.paymentSchedule.filter(
          (scheduleItem: any) => scheduleItem.status === "paid"
        );
        let paidPrincipal = 0;
        const payDate = this.paymentManagement.nextPaymentSchedule;
        if (responsePay.length > 0) {
          let j = 0;
          for (const payV in responsePay) {
            paidPrincipal = responsePay[j].principal + paidPrincipal;
            j = j + 1;
          }
        }
        const DateObj = new Date(payDate);
        const dates = DateObj.getDate();
        let months = DateObj.getMonth() + 1;
        let years = DateObj.getFullYear();
        for (const x in response) {
          const resp: any = response[i];
          if (i == 0) {
            startPrincipal = resp.startPrincipal - paidPrincipal;
            resp.startPrincipal = startPrincipal;
            resp.interest = 0;
            resp.amount = this.paymentManagement.promoPaymentAmount - resp.fees;
            resp.principal = resp.amount;
            resp.endPrincipal = resp.startPrincipal - resp.amount;
            endPrincipal = resp.endPrincipal;
          } else {
            resp.startPrincipal = endPrincipal;
            startPrincipal = resp.startPrincipal;
            resp.amount = this.paymentManagement.promoPaymentAmount - resp.fees;
            resp.interest = 0;
            resp.principal = resp.amount;
            resp.endPrincipal = endPrincipal - resp.amount;
            endPrincipal = resp.endPrincipal;
          }
          resp.date = `${months}/${dates}/${years}`;
          if (months == 12) {
            months = 1;
            years = years + 1;
          } else {
            months = months + 1;
          }
          if (startPrincipal > this.paymentManagement.promoPaymentAmount) {
            response1.push(resp);
          } else if (startPrincipal > 0) {
            resp.amount = resp.startPrincipal - resp.fees;
            resp.interest = 0;
            resp.principal = resp.startPrincipal;
            resp.endPrincipal = 0;
            response1.push(resp);
          }
          i = i + 1;
        }
        return response1;
      }
      return undefined;
    },
    payments(): undefined | any[] {
      if (this.paymentManagement && this.paymentManagement.paymentSchedule) {
        const response = this.paymentManagement.paymentSchedule.filter(
          (payment: any) =>
            payment.status === "paid" || payment.status === "failed"
        );

        return response;
      }
      return undefined;
    },
  },

  methods: {
    async forgiveSingleLateFee(payment: any) {
      const splitDate = payment.date
        .toString()
        .split("T")[0]
        .split("-")
        .reverse()
        .join("/")
        .split(/\//);
      const finalDate = [splitDate[1], splitDate[0], splitDate[2]].join("/");

      try {
        const result = await this.$swal({
          title: `Do you want to forgive Late fee with amount of $${Number(payment.amount).toFixed(2) } on date ${finalDate}?`,
          showCancelButton: true,
          icon: "info",
          reverseButtons: false,
          confirmButtonText: `Yes`,
          cancelButtonText: `Cancel`,
        });
        if (result.isConfirmed) {
          await adminDashboardRequests.forgiveSingleLateFee(
            this.screenTrackingId,
            payment
          );
          await this.$swal({
            title: "Alert",
            text: "Success!",
            icon: "success",
          });
        }
        this.reloadPage();
      } catch (error) {
        await this.$swal({
          title: "Alert",
          text: "Could not forgive Late fee",
          icon: "error",
        });
      }
    },
    async forgiveSingleNsfFee(payment: any) {
      const splitDate = payment.date
        .toString()
        .split("T")[0]
        .split("-")
        .reverse()
        .join("/")
        .split(/\//);
      const finalDate = [splitDate[1], splitDate[0], splitDate[2]].join("/");

      try {
        const result = await this.$swal({
          title: `Do you want to forgive NSF fee with amount of ${payment.amount} on date ${finalDate}?`,
          showCancelButton: true,
          icon: "info",
          reverseButtons: false,
          confirmButtonText: `Yes`,
          cancelButtonText: `Cancel`,
        });
        if (result.isConfirmed) {
          await adminDashboardRequests.forgiveSingleNsfFee(
            this.screenTrackingId,
            payment
          );
          await this.$swal({
            title: "Alert",
            text: "Success!",
            icon: "success",
          });
        }
        this.reloadPage();
      } catch (error) {
        await this.$swal({
          title: "Alert",
          text: "Could not forgive NSF fee",
          icon: "error",
        });
      }
    },
    async turnOnPromo() {
      try {
        if (this.paymentManagement) {
          const requestData = { paymentManagementId: this.paymentManagement._id };
          let changeAmount = this.amountToNumber;

          if (this.promoStatus == false) {
            this.promoStatus = true;
            this.promoCheck = true;
            this.amount = this.paymentManagement.promoPaymentAmount;
            changeAmount = this.amountToNumber;
          } else {
            this.promoStatus = false;
            this.promoCheck = false;
            this.amount = this.paymentManagement.minimumPaymentAmount;
            changeAmount = this.amountToNumber;
          }
          await adminDashboardRequests.changePromoAmount(
            this.screenTrackingId,
            {
              amount: changeAmount,
            }
          );
          await this.$swal({
            title: "Success!",
            text: `Promo Status changed to ${this.promoStatus}`,
            icon: "success",
          });
          this.reloadPage();
        }
        else {
          this.$emit('updateTabIndex', 3);
          await this.$swal({
            title: "Alert",
            text: "Something went wrong. Try again later",
            icon: "info",
          });
        }
      } catch (error) {
        const errorMessage = await errorHandler(error, this.$router);
        if (errorMessage) {
          await this.$swal({
            title: "Error",
            text: `${errorMessage}`,
            icon: "error",
          });
        }
      }
    },
    async turnOnPromopay() {
      try {
        if (this.promopayStatus == false) {
          this.promopayStatus = true;
          this.promopayCheck = true;
        } else {
          this.promopayStatus = false;
          this.promopayCheck = false;
        }
      } catch (error) {
        // const errorMessage = await errorHandler(error, this.$router);
        // if (errorMessage) {
        //   await this.$swal({
        //     title: "Error",
        //     text: `${errorMessage}`,
        //     icon: "error",
        //   });
        // }
      }
    },
    async reloadPage() {
      try {
        const { data } = await adminDashboardRequests.getPaymentManagement(
          this.screenTrackingId
        );
        const pm = data.response;
        const ledger = data.ledger;
        if (
          pm?.status === "in-repayment prime" ||
          pm?.status === "in-repayment" ||
          pm?.status === "in-repayment non-prime" ||
          pm?.status === "in-repayment delinquent1" ||
          pm?.status === "in-repayment delinquent2" ||
          pm?.status === "in-repayment delinquent3" ||
          pm?.status === "in-repayment delinquent4"
        ) {
          this.isInRepayment = true;
        } else if (pm?.status === "paid") {
          this.isInRepayment = false;
          this.isPaid = true;
        }

        this.paymentManagement = pm;
        this.ledger = ledger;
      } catch (error) {
        if (error.response.status === 404) {
          return;
        }

        const errorMessage = await errorHandler(error, this.$router);
        if (errorMessage) {
          const Toast = this.$swal.mixin({
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 7000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", this.$swal.stopTimer);
              toast.addEventListener("mouseleave", this.$swal.resumeTimer);
            },
          });
          Toast.fire({ icon: "error", title: `${errorMessage}` });
        }
      }
    },

    async partialReturn(email: string) {
      this.$swal
        .fire({
          title: "Partial Return",
          text: "Enter the amount to be returned",
          input: "number",
          showCancelButton: true,
          confirmButtonColor: "green",
        })
        .then((result) => {
          if (result.value) {
            const ss = parseInt(result.value);
            partialReturnDetails(email || "", ss);
            this.$swal.fire("Result:" + result.value);
          }
        });
    },

    async closeLoan(email: string) {
      this.$swal
        .fire({
          title: "Do you want to close your existing loan with Patria",
          showCancelButton: true,
          icon: "info",
          reverseButtons: false,
          confirmButtonText: `Yes`,
          cancelButtonText: `Cancel`,
        })
        .then((result) => {
          /* Read more about isConfirmed, isDenied below */
          if (result.isConfirmed) {
            try {
              closeLoanDetails(email || "");
              this.$swal({
                title: "Alert",
                text: "Email sent",
                icon: "success",
              });
            } catch (error) {
              this.$swal({
                title: "Alert",
                text: "Could not send close loan email",
                icon: "error",
              });
            }
          } else if (result.isDenied) {
            return false;
          }
        });
    },

    async forgivePayment() {
      try {
        const result = await this.$swal({
          title: "Do you want to waive next payment from the schedule?",
          showCancelButton: true,
          icon: "info",
          reverseButtons: false,
          confirmButtonText: `Yes`,
          cancelButtonText: `Cancel`,
        });
        if (result.isConfirmed) {
          await adminDashboardRequests.forgivePayment(this.screenTrackingId);
          await this.$swal({
            title: "Alert",
            text: "Success!",
            icon: "success",
          });
        }
        this.reloadPage();
      } catch (error) {
        await this.$swal({
          title: "Alert",
          text: "Could not forgive payment",
          icon: "error",
        });
      }
    },

    async forgiveLateFee() {
      try {
        const result = await this.$swal({
          title: "Do you want to forgive all late fees for this loan?",
          showCancelButton: true,
          icon: "info",
          reverseButtons: false,
          confirmButtonText: `Yes`,
          cancelButtonText: `Cancel`,
        });
        if (result.isConfirmed) {
          await adminDashboardRequests.forgiveLatefee(this.screenTrackingId);
          await this.$swal({
            title: "Alert",
            text: "Success!",
            icon: "success",
          });
        }
        this.reloadPage();
      } catch (error) {
        await this.$swal({
          title: "Alert",
          text: "Could not forgive late fee",
          icon: "error",
        });
      }
    },

    async forgiveNsfFee() {
      try {
        const result = await this.$swal({
          title: "Do you want to forgive all NSF fee for this loan?",
          showCancelButton: true,
          icon: "info",
          reverseButtons: false,
          confirmButtonText: `Yes`,
          cancelButtonText: `Cancel`,
        });
        if (result.isConfirmed) {
          await adminDashboardRequests.forgiveNsfFee(this.screenTrackingId);
          await this.$swal({
            title: "Alert",
            text: "Success!",
            icon: "success",
          });
        }
        this.reloadPage();
      } catch (error) {
        await this.$swal({
          title: "Alert",
          text: "Could not forgive NSF fee",
          icon: "error",
        });
      }
    },

    async deferPayment() {
      try {
        const result = await this.$swal({
          title:
            "Do you want to defer the next available payment for this loan?",
          showCancelButton: true,
          icon: "info",
          reverseButtons: false,
          confirmButtonText: `Yes`,
          cancelButtonText: `Cancel`,
        });
        if (result.isConfirmed) {
          await adminDashboardRequests.deferPayment(this.screenTrackingId);
          await this.$swal({
            title: "Alert",
            text: "Success!",
            icon: "success",
          });
        }
        this.reloadPage();
      } catch (error) {
        await this.$swal({
          title: "Alert",
          text: "Could not defer payment",
          icon: "error",
        });
      }
    },

    async toggleAutopay() {
      try {
        if (this.paymentManagement) {
          await adminDashboardRequests.toggleAutopay(
            this.paymentManagement._id
          );
          await this.$swal({
            title: "Success!",
            text: `AutoPay is ${this.paymentManagement.canRunAutomaticPayment
              ? "Enabled"
              : "Disabled"
              }!`,
            icon: "success",
          });
          this.$emit("reloadPage");
        }
      } catch (error) {
        const errorMessage = await errorHandler(error, this.$router);
        if (errorMessage) {
          await this.$swal({
            title: "Error",
            text: `${errorMessage}`,
            icon: "error",
          });
        }
      }
    },

    async determineCollectionTier(
      days: number,
      dPeriod: number
    ): Promise<string> {
      if (days >= dPeriod) {
        return "Unassigned";
      } else {
        return "";
      }
    },

    async checkCollections() {
      if (this.paymentManagement && this.paymentManagement.paymentSchedule) {
        const response = this.paymentManagement.paymentSchedule.filter(
          (scheduleItem: any) => scheduleItem.status === "opened"
        );
        const today = moment().startOf("day").toDate();
        const { data: LoanSettings } =
          await adminDashboardRequests.getLoanSettings();
        this.loanPeriod = LoanSettings.delinquencyPeriod;
        const collectionStatus = await this.determineCollectionTier(
          moment(today).diff(response[0].date, "day"),
          this.loanPeriod
        );
        this.collectionCheck = collectionStatus;
        if (
          this.paymentManagement.collectionAssignStatus &&
          this.paymentManagement.collectionAssignStatus != ""
        ) {
          this.collectionCheck = "";
        }
      } else {
        this.collectionCheck = "";
      }
    },

    async movetocollections(emails: string, inout: string) {
      if (emails) {
        try {
          let titleString = "Do you want to move this loan to collections";
          let alertString = "Loan moved to collections";
          let type = "Lending";
          if (inout == "out") {
            titleString = "Do you want to move this loan out of collections";
            alertString = "Loan moved out of collections";
            type = "Collections";
          }
          this.$swal
            .fire({
              title: titleString,
              showCancelButton: true,
              icon: "info",
              reverseButtons: false,
              confirmButtonText: `Yes`,
              cancelButtonText: `Cancel`,
            })
            .then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const myArrayFromLocalStorage =
                    localStorage.getItem("collectionData")!;
                  const myArray = JSON.parse(myArrayFromLocalStorage);
                  const moveResult = await moveLoanCollections(emails, type);
                  this.$swal({
                    title: "Alert",
                    text: `${alertString}`,
                    icon: "info",
                    confirmButtonText: `Ok`,
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      this.$router.go(0);
                    }
                  });
                } catch (error) {
                  this.$swal({
                    title: "Alert",
                    text: "Loan cannot be moved",
                    icon: "info",
                    confirmButtonText: `Ok`,
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      this.$router.go(0);
                    }
                  });
                }
              } else if (result.isDismissed) {
                //this.$router.go(0)
                return false;
              }
            });
        } catch (error) {
          this.$swal({
            title: "Alert",
            text: "Loan cannot be moved to collections",
            icon: "info",
          });
        }
      }
    },
  },

  async mounted() {
    try {
      const { data } = await adminDashboardRequests.getPaymentManagement(
        this.screenTrackingId
      );
      const pm = data.response;
      const ledger = data.ledger;
      if (
        pm?.status === "in-repayment prime" ||
        pm?.status === "in-repayment" ||
        pm?.status === "in-repayment non-prime" ||
        pm?.status === "in-repayment delinquent1" ||
        pm?.status === "in-repayment delinquent2" ||
        pm?.status === "in-repayment delinquent3" ||
        pm?.status === "in-repayment delinquent4"
      ) {
        this.isInRepayment = true;
      } else if (pm?.status === "paid") {
        this.isInRepayment = false;
        this.isPaid = true;
      } else if (pm?.status === "closed") {
        this.isInRepayment = false;
        this.isPaid = false;
        this.isClosed = true;
      }
      this.paymentManagement = pm;
      this.ledger = ledger;
      this.checkCollections();
    } catch (error) {
      if (error.response.status === 404) {
        return;
      }

      const errorMessage = await errorHandler(error, this.$router);
      if (errorMessage) {
        const Toast = this.$swal.mixin({
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 7000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", this.$swal.stopTimer);
            toast.addEventListener("mouseleave", this.$swal.resumeTimer);
          },
        });
        Toast.fire({ icon: "error", title: `${errorMessage}` });
      }
    }
  },
});
</script>

<style scoped>
table {
  width: 100%;
  border: 1px solid #f4f4f4;
}

td {
  border: 1px solid #f4f4f4;
  padding: 10px;
}

tr> :first-child {
  font-weight: bold;
}
</style>
