<template>
  <div>
    <div v-if="isInRepayment || isPaid" class="summary-section">
      <div class="summary-row large-padding">
        <div class="summary-title">Payment Portal</div>
        <div class="summary-action"></div>
      </div>
      <div class="summary-row large-padding">
        <div class="summary-key width-40">Next Payment Schedule Date</div>
        <div class="summary-value">{{ paymentManagement.nextPaymentSchedule | date }}</div>
      </div>
      <!-- <div class="summary-row large-padding">
        <div class="summary-key width-40">Minimum payment amount</div>
        <div class="summary-value">{{ paymentManagement.minimumPaymentAmount | currency }}</div>
      </div> -->
      <div class="summary-row large-padding">
        <div class="summary-key width-40">Next payment amount</div>
        <div class="summary-value">{{ getNextPaymentAmount(paymentManagement) }}</div>
      </div>
      <div class="summary-row large-padding">

        <div class="summary-key width-40">Current payment amount</div>
        <div class="summary-value">
          {{
              paymentManagement.currentPaymentAmount | currency
          }}

        </div>
      </div>
      <div class="summary-row large-padding">
        <ChangePaymentAmount v-if="
          isInRepayment
        " :screenTrackingId="screenTrackingId" :regularAmount="paymentManagement.minimumPaymentAmount"
          :promoAmount="paymentManagement.promoPaymentAmount" :currentAmount="paymentManagement.currentPaymentAmount"
          :payoffAmount="paymentManagement.payOffAmount" @reloadPage="reloadPage" style="text-align:right;" />
      </div>
    </div>

    <div v-if="isInRepayment || isPaid" style="margin: 8px 0px; height: 49px; display: flex; align-items: center;">
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
    <div v-if="payments && payments.length >= 1 && promopayStatus == false" style="overflow:auto;">
      <table>
        <thead>
          <tr>
            <th style="width: 10px">#</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Payment Type</th>
            <th>Start balance</th>
            <th>Applied to Fees</th>
            <th>Applied to Interest</th>
            <th>Applied to Principal</th>
            <th>End Principal Balance</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(payment, index) in payments" :key="payment.paymentId">
            <td>{{ index + 1 }}</td>
            <td>{{ payment.amount | currency }}</td>
            <td v-if="payment.status == 'failed'">{{ payment.status }} - {{ payment.transactionMessage }}</td>
            <td v-if="payment.status == 'paid'">{{ payment.status }}</td>
            <td>{{ payment.paymentType }}</td>
            <td>{{ payment.startPrincipal | currency }}</td>
            <td>{{ payment.paidFees | currency }}</td>
            <td>
              {{
                  (payment.paidInterest + payment.paidPastDueInterest) | currency
              }}
            </td>
            <td>{{ payment.paidPrincipal | currency }}</td>
            <td>{{ payment.endPrincipal | currency }}</td>
            <td>{{ payment.date | date }}</td>
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
    <div v-else>
      <span>No transaction records yet.</span>
    </div>

    <div v-if="isInRepayment || isPaid"
      style="display: flex; justify-content: space-between; align-items: center; margin: 8px 0px;">
      <h3>Payment Schedule Information</h3>
      <MakePaymentButton :screenTrackingId="screenTrackingId" :regularAmount="paymentManagement.minimumPaymentAmount"
        :promoAmount="paymentManagement.promoPaymentAmount" :currentAmount="paymentManagement.currentPaymentAmount"
        :payoffAmount="paymentManagement.payOffAmount" v-if="
        isInRepayment" @reloadPage="reloadPage" />
    </div>
    <div v-if="isInRepayment || isPaid" style="overflow:auto;">
      <table>
        <thead>
          <tr>
            <th style="width: 10px">#</th>
            <th>Unpaid Principal Balance</th>
            <th>Principal</th>
            <th>Interest</th>
            <th>Fees</th>
            <th>Amount</th>
            <th>Schedule Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(paymentScheduleItem, index) in paymentScheduleLeft" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              {{ paymentScheduleItem.startPrincipal | currency }}
            </td>
            <td>
              {{ paymentScheduleItem.principal | currency }}
            </td>
            <td>{{ paymentScheduleItem.interest | currency }}</td>
            <td>{{ paymentScheduleItem.fees | currency }}</td>
            <td>{{ paymentScheduleItem.amount | currency }}</td>
            <td>{{ paymentScheduleItem.date | date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { getApplicationData } from "@/user-application/application/api";
import { getDashboardData } from "@/user-application/dashboard/api";
import MakePaymentButton from "@/user-application/dashboard/components/MakePaymentButton.vue";
import ChangePaymentAmount from "@/user-application/dashboard/components/ChangePaymentAmount.vue";
import { errorHandler } from "@/api/error-handler";

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
      isInRepayment: false,
      isPaid: false,
      paymentManagement: [] as any,
      email: "",
      promopayStatus: false,
      promopayCheck: false,
    };
  },

  created() {
    this.promopayStatus = false;
    this.promopayCheck = false;
  },

  computed: {
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
    getNextPaymentAmount(paymentManagement: any) {
      const data = paymentManagement?.paymentSchedule?.find((item: any) => item.status === 'opened')
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      });
      return formatter.format(data.amount) || 'N/A';
    },
    async turnOnPromopay() {
      try {
        if (this.paymentManagement) {
          if (this.promopayStatus == false) {
            this.promopayStatus = true;
            this.promopayCheck = true;
          } else {
            this.promopayStatus = false;
            this.promopayCheck = false;
          }
        }
        else {
          //this.$emit('updateTabIndex', 3);
          // await this.$swal({
          //   title: "Alert",
          //   text: "Something went wrong. Try again later",
          //   icon: "info",
          // });
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
    async reloadPage() {
      try {
        const dashboardDataResponse = await getDashboardData();
        const {
          paymentManagementData,
          email,
        } = dashboardDataResponse.data;
        this.email = email;

        if (
          paymentManagementData?.status === "in-repayment prime" ||
          paymentManagementData?.status === "in-repayment non-prime"
        ) {
          this.isInRepayment = true;
        } else if (paymentManagementData?.status === "paid") {
          this.isInRepayment = false;
          this.isPaid = true;
        }

        this.paymentManagement = paymentManagementData;
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
  },

  async mounted() {
    try {
      const [
        applicationDataResponse,
        dashboardDataResponse,
      ] = await Promise.all([getApplicationData(), getDashboardData()]);
      const {
        paymentManagementData,
        email,
      } = dashboardDataResponse.data;
      this.email = email;
      if (
        paymentManagementData?.status === "in-repayment prime" ||
        paymentManagementData?.status === "in-repayment non-prime" ||
        paymentManagementData?.status === "in-repayment delinquent1" ||
        paymentManagementData?.status === "in-repayment delinquent2" ||
        paymentManagementData?.status === "in-repayment delinquent3" ||
        paymentManagementData?.status === "in-repayment delinquent4"

      ) {
        this.isInRepayment = true;
      } else if (paymentManagementData?.status === "paid") {
        this.isInRepayment = false;
        this.isPaid = true;
      }

      this.paymentManagement = paymentManagementData;
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
