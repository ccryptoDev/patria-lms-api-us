<template>
  <div>
    <!-- <div style="text-align: right" @click="showPreviewPayment">
      <button class="primary" style="margin-right: 10px">Amend Payment</button>
    </div> -->
    <div class="tooltipvue" @click="showPreviewPayment">
        <button class="primary" style="margin-right: 10px">Amend Payment</button>
        <span class="tooltiptextvue">Can Amend upcoming scheduled payment</span>
      </div>
    <VueFinalModal
      v-model="modal"
      classes="share-modal-container"
      content-class="share-modal-content"
      :clickToClose="false"
    >
      <div
        v-if="previewPaymentComponent"
        class="container"
        style="width: 35vw; height: 600px; overflow: auto"
      >
        <h3>Amend Payment</h3>
        <ValidationObserver v-slot="{ invalid }">
          <form @submit="onNext">
            <div class="row">
              <div style="margin-right: 10px; width: 48%">
                <label
                  ><span class="dates">{{ changeFormat(paymentDate) }}</span>
                </label>
              </div>
              <div style="margin-left: 10px; width: 48%">
                <label>Amount</label>
                <div>
                  <ValidationProvider
                    rules="positive"
                    mode="lazy"
                    v-slot="{ errors }"
                  >
                    <input
                      type="text"
                      v-mask="mask"
                      v-model="amount"
                      :class="{
                        'text-danger': errors[0],
                        'amount-input-error': errors[0],
                        'form-control': true,
                      }"
                      style="width: 100%"
                      @blur="onAmountBlur"
                      @keydown="onAmountKeyDown"
                    />
                    <span
                      class="text-danger amount-error"
                      style="display: block"
                      >{{ errors[0] }}</span
                    >
                  </ValidationProvider>
                </div>
              </div>
            </div>
            <div class="row">
              <div style="width: 100%">
                <div v-if="userCards && userCards.length > 0">
                  <label>Debit Card/Credit Card</label>
                  <div>
                    <select v-model="selectedCard" class="form-control">
                      <option
                        v-for="card in userCards"
                        :key="card.paymentMethodToken"
                        :value="card.paymentMethodToken"
                      >
                        **** **** **** {{ card.cardNumberLastFour }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <p>Payments will be applied fully to outstanding amounts.</p>
            </div>
            <div class="row">
              <table style="margin-bottom: 15px">
                <tbody>
                  <tr>
                    <td class="text-left">Payment</td>
                    <td style="width: 215px" class="text-right" colspan="3">
                      {{ amount }}
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td style="width: 120px">Now</td>
                    <td style="width: 120px">Payment</td>
                    <td style="width: 120px">After</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td style="width: 120px">Scheduled</td>
                    <td style="width: 120px">Payment</td>
                    <td style="width: 120px">Waived</td>
                  </tr>
                  <tr>
                    <td class="text-left">Accrued Interest</td>
                    <td colspan="3" style="text-align: right">
                      {{ previewResult.preview.accruedInterest | currency }}
                    </td>
                  </tr>
                  <!-- <tr
                    v-if="
                      previewResult.preview.accruedBalance
                        .unpaidInterest > 0
                    "
                  >
                    <td class="text-left">
                      Unpaid Interest
                      <span style="font-size: 0.80rem; color: #888;"
                        >({{ previewResult.preview.daysPastDue }}
                        day(s) past due)
                      </span>
                    </td>
                    <td class="text-right" style="width: 120;">
                      {{
                        previewResult.preview.accruedBalance
                          .unpaidInterest | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120;">
                      {{
                        previewResult.preview.paymentBalance
                          .unpaidInterest | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120;">
                      {{
                        previewResult.preview.unpaidBalance
                          .unpaidInterest | currency
                      }}
                    </td>
                  </tr> -->
                  <tr>
                    <td class="text-left">Interest</td>
                    <td class="text-right" style="width: 120">
                      {{
                        previewResult.preview.amendedBalance.interest | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120">
                      {{
                        previewResult.preview.amendedBalance.amendedInterest
                          | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120">
                      {{
                        (previewResult.preview.amendedBalance.interest -
                          previewResult.preview.amendedBalance.amendedInterest)
                          | currency
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">Principal</td>
                    <td class="text-right" style="width: 120">
                      {{
                        previewResult.preview.amendedBalance.principal
                          | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120">
                      {{
                        previewResult.preview.amendedBalance.amendedPrincipal
                          | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120px">
                      {{
                        (previewResult.preview.amendedBalance.principal -
                          previewResult.preview.amendedBalance.amendedPrincipal)
                          | currency
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="row">
              <button
                @click="hidePreviewPayment"
                class="secondary"
                style="margin-right: 10px"
              >
                Cancel
              </button>
              <button
                :disabled="invalid"
                type="submit"
                class="primary"
                style="margin-left: 10px"
              >
                Next
              </button>
            </div>
          </form>
        </ValidationObserver>
      </div>
      <div v-if="previewNewScheduleComponent">
        <h3>Confirm Amend Payment</h3>
        <p>preview of remaining payment schedule</p>
        <div style="height: 60vh; overflow: auto">
          <table style="overflow: auto">
            <tbody>
              <tr>
                <th class="primary">Date</th>
                <th class="primary">Balance</th>
                <th class="primary">Payment</th>
                <th class="primary">Fees</th>
                <th class="primary">Interest</th>
                <th class="primary">Principal</th>
                <th class="primary">Waived Interest</th>
                <th class="primary">Waived Principal</th>
              </tr>
              <tr
                v-for="paymentScheduleItem in paymentScheduleLeft"
                :key="paymentScheduleItem.month"
              >
                <td class="text-left">
                  {{ paymentScheduleItem.date | date }}
                </td>
                <td class="text-left">
                  {{ paymentScheduleItem.startPrincipal | currency }}
                </td>
                <td class="text-left">
                  {{ paymentScheduleItem.payment }}
                </td>
                <td class="text-left">
                  {{ paymentScheduleItem.fees | currency }}
                </td>
                <td class="text-left">
                  {{ paymentScheduleItem.interest | currency }}
                </td>
                <td class="text-left">
                  {{ paymentScheduleItem.principal | currency }}
                </td>
                <td class="text-left">
                  {{
                    (previewResult.preview.amendedBalance.interest -
                      previewResult.preview.amendedBalance.amendedInterest)
                      | currency
                  }}
                </td>
                <td class="text-left">
                  {{
                    (previewResult.preview.amendedBalance.principal -
                      previewResult.preview.amendedBalance.amendedPrincipal)
                      | currency
                  }}
                </td>
              </tr>
            </tbody>
          </table>
          <div style="margin-top: 15px">
            <button
              @click="goToPreviewPayment"
              class="secondary"
              style="margin-right: 10px"
            >
              Back
            </button>
            <button
              @click="amendPayment"
              style="margin-left: 10px"
              class="primary"
              :disabled="isLoading"
            >
              <span v-if="isPaymentToday">Submit Payment</span>
              <span v-else>Schedule Payment</span>
              <b-spinner small v-show="isLoading"></b-spinner>
            </button>
          </div>
        </div>
      </div>
    </VueFinalModal>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import moment from "moment";
import createNumberMask from "text-mask-addons/dist/createNumberMask";
import Datepicker from "vuejs-datepicker";
import { extend } from "vee-validate";

import { adminDashboardRequests } from "@/api/admin-dashboard";
import { errorHandler } from "@/api/error-handler";
import { isCardExpired } from "@/admin-dashboard/helpers/";

extend("positive", (value: any) => {
  if (typeof value === "string") {
    const parsedAmount = value.replace(/[$,]/g, "");
    const isLowerThanOne = parseFloat(parsedAmount) < 1;
    if (isLowerThanOne) {
      return "Amount must be greater than $1.00";
    }
    return true;
  } else {
    if (value < 1) {
      return "Amount must be greater than $1.00";
    }
    return true;
  }
});

const currencyMask = createNumberMask({
  prefix: "$",
  allowDecimal: true,
  includeThousandsSeparator: true,
  allowNegative: false,
  integerLimit: 4,
});

export default Vue.extend({
  components: {
    //Datepicker,
  },

  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },

  data() {
    return {
      modal: false,
      previewPaymentComponent: false,
      previewNewScheduleComponent: false,
      isMonthlyPayment: true,
      isPayoff: false,
      previewResult: undefined as any,
      previewResults: undefined as any,
      userCards: [] as {
        paymentMethodToken: string;
        cardNumberLastFour: string;
      }[],
      selectedCard: "",
      type: "Amended",
      paymentManagement: [] as any,
      amount: "",
      newScheduleItemTransactionId: "",
      scheduleIndex: "",
      paymentType: "regular",
      paymentDate: new Date(),
      isLoading: false,
      mask: currencyMask,
      val: false,
      indexs: 0,
      disabledDates: {
        to: moment().startOf("day").toDate(),
        from: moment().add(1, "months").startOf("day").toDate(),
      },
    };
  },

  computed: {
    amountToNumber(): number {
      if (typeof this.amount === "string") {
        const newAmount = parseFloat(this.amount.replace(/[$,]/g, ""));
        return newAmount;
      }

      return this.amount;
    },
    isPaymentToday(): boolean {
      return moment(this.paymentDate)
        .startOf("day")
        .isSame(moment().startOf("day"));
    },
    parsedPaymentDate(): Date {
      return moment(this.paymentDate).startOf("day").toDate();
    },
    paymentScheduleLeft(): any[] {
      const response = this.previewResult.preview.paymentSchedule.filter(
        (scheduleItem: any) =>
          scheduleItem.transactionId ===
          this.previewResult.preview.scheduleIndex
      );
      response[0]["payment"] = this.amount;
      return response;
    },
  },

  //    fees: 0,
  //         interest: 0,
  //         unpaidInterest: 0,
  //         principal: 0,

  methods: {
    async onNext() {
      //this.showPopup();
      //if(this.val != true){
      this.goToNewSchedule();
      //}
    },
    async showPopup(sender: any[]) {
      await this.$swal({
        title: "Error",
        text: `${JSON.stringify(sender)}`,
        icon: "error",
      });
    },
    async reloadPage() {
      try {
        const { data } = await adminDashboardRequests.getPaymentManagement(
          this.screenTrackingId
        );
        this.paymentManagement = data.response;
        const today = moment().startOf("day").toDate();
        if (
          moment(this.paymentManagement.nextPaymentSchedule).isBefore(
            moment(today),
            "day"
          )
        ) {
          this.val = true;
          this.disabledDates = {
            to: moment().startOf("day").toDate(),
            from: moment().add(1, "months").startOf("day").toDate(),
          };
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
    goToPreviewPayment() {
      this.previewNewScheduleComponent = false;
      this.previewPaymentComponent = true;
    },
    async onAmountBlur(event: any) {
      const parsedAmount = (event.target.value as string).replace(/[$,]/, "");
      if (parseFloat(parsedAmount) < 1) {
        return;
      }
      
      if (
        parseFloat(parsedAmount) <= parseFloat(this.previewResult.paymentAmount)
      ) {
          this.amendedPayment(parsedAmount);
      } else {
        this.amount = Number(this.previewResults.paymentAmount).toFixed(2);
        this.amendedPayment(this.amount);
      }

      //this.previewResults= previewResult;
    },
    async amendedPayment(parsedAmount: string) {
      const { data } = await adminDashboardRequests.getPaymentPreview(
        this.screenTrackingId,
        {
          amount: this.previewResult.paymentAmount,
          paymentDate: this.parsedPaymentDate,
        }
      );

      const { previewResult } = data;
      this.amount = Number(parsedAmount).toFixed(2);
      this.newScheduleItemTransactionId =
        previewResult.preview.newScheduleItemTransactionId;
      this.scheduleIndex = previewResult.preview.scheduleIndex;
      const response = this.paymentScheduleLeft;

      previewResult.preview.amendedBalance.interest = response[0]["interest"];
      previewResult.preview.amendedBalance.principal = response[0]["principal"]; //amendedInterest
      
      if (
        parseFloat(parsedAmount) >=
        previewResult.preview.amendedBalance.principal
      ) {
        previewResult.preview.amendedBalance.amendedPrincipal =
          previewResult.preview.amendedBalance.principal;
      } else {
        previewResult.preview.amendedBalance.amendedPrincipal =
          parseFloat(parsedAmount); //previewResult.preview.amendedBalance.principal - parseFloat(parsedAmount);
      }
      
      if (
        previewResult.preview.amendedBalance.amendedPrincipal ==
        previewResult.preview.amendedBalance.principal
      ) {
        const amendedAmount = Number(parseFloat(parsedAmount) -
            previewResult.preview.amendedBalance.amendedPrincipal).toFixed(2);
        if (
          amendedAmount >=
          previewResult.preview.amendedBalance.interest
        ) {
          previewResult.preview.amendedBalance.amendedInterest =
            previewResult.preview.amendedBalance.interest;
        } else {
          previewResult.preview.amendedBalance.amendedInterest =
            (parseFloat(parsedAmount) -
              previewResult.preview.amendedBalance.amendedPrincipal);
        }
      } else {
        previewResult.preview.amendedBalance.amendedInterest = 0.0; //previewResult.preview.amendedBalance.interest;//previewResult.preview.amendedBalance.interest - parseFloat(parsedAmount);
      }
      response[0]["principal"] =
        previewResult.preview.amendedBalance.amendedPrincipal;
      response[0]["interest"] =
        previewResult.preview.amendedBalance.amendedInterest;
      this.previewResult = previewResult;
    },
    goToNewSchedule() {
      this.previewPaymentComponent = false;
      this.previewNewScheduleComponent = true;
    },
    async showPreviewPayment() {
      this.modal = true;
      if (!this.userCards || this.userCards.length <= 0) {
        await this.$swal({
          title: "Error",
          text: "User didn't add a card yet",
          icon: "error",
        });
        this.modal = false;
        return;
      }

      this.previewPaymentComponent = true;

      const { data } = await adminDashboardRequests.getPaymentPreview(
        this.screenTrackingId,
        { paymentDate: this.parsedPaymentDate }
      );
      const { previewResult } = data;

      this.amount = Number(previewResult.paymentAmount).toFixed(2);
      this.newScheduleItemTransactionId =
        previewResult.preview.newScheduleItemTransactionId;
      const parsedAmount = (this.amount as string).replace(/[$,]/, "");
      const response = this.paymentScheduleLeft;
      previewResult.preview.amendedBalance.interest = response[0]["interest"];
      previewResult.preview.amendedBalance.principal = response[0]["principal"]; //amendedInterest
      if (
        parseFloat(parsedAmount) >=
        previewResult.preview.amendedBalance.principal
      ) {
        previewResult.preview.amendedBalance.amendedPrincipal =
          previewResult.preview.amendedBalance.principal;
      } else {
        previewResult.preview.amendedBalance.amendedPrincipal =
          previewResult.preview.amendedBalance.principal -
          parseFloat(parsedAmount);
      }

      if (
        previewResult.preview.amendedBalance.amendedPrincipal ==
        previewResult.preview.amendedBalance.principal
      ) {
        const amendedAmount = Number(parseFloat(parsedAmount) -
            previewResult.preview.amendedBalance.amendedPrincipal).toFixed(2);
        if (
          amendedAmount >=
          previewResult.preview.amendedBalance.interest
        ) {
          previewResult.preview.amendedBalance.amendedInterest =
            previewResult.preview.amendedBalance.interest;
        } else {
          previewResult.preview.amendedBalance.amendedInterest = 0.0;
            previewResult.preview.amendedBalance.interest -
            (parseFloat(parsedAmount) -
              previewResult.preview.amendedBalance.amendedPrincipal);
        }
      } else {
        previewResult.preview.amendedBalance.amendedInterest =
          previewResult.preview.amendedBalance.interest; //previewResult.preview.amendedBalance.interest - parseFloat(parsedAmount);
      }
      response[0]["principal"] =
        previewResult.preview.amendedBalance.amendedPrincipal;
      response[0]["interest"] =
        previewResult.preview.amendedBalance.amendedInterest;
       
      this.previewResult = previewResult;
      //this.showPopup(previewResult);
      //if(this.indexs == 1){
      this.previewResults = previewResult;
      //}
    },
    hidePreviewPayment: async function () {
      this.modal = false;
      this.previewPaymentComponent = false;
      this.previewNewScheduleComponent = false;
      this.isMonthlyPayment = true;
      this.isPayoff = false;
      const { data } = await adminDashboardRequests.getUserCards(
        this.screenTrackingId
      );
      if (data && data.length > 0) {
        this.selectedCard = data.find(
          (card: any) => card.isDefault
        ).paymentMethodToken;
      }
    },
    async toggleMonthlyPayment() {
      this.isPayoff = false;
      this.isMonthlyPayment = true;
      const { data } = await adminDashboardRequests.getPaymentPreview(
        this.screenTrackingId,
        { paymentDate: this.parsedPaymentDate }
      );
      const { previewResult } = data;

      this.previewResult = previewResult;
      this.amount = Number(previewResult.paymentAmount).toFixed(2);
      this.newScheduleItemTransactionId =
        previewResult.preview.newScheduleItemTransactionId;
    },
    async togglePayoff() {
      this.isMonthlyPayment = false;
      this.isPayoff = true;
      const { data } = await adminDashboardRequests.getPaymentPreview(
        this.screenTrackingId,
        {
          amount: this.previewResult.ledger.payoff,
          paymentDate: this.parsedPaymentDate,
        }
      );
      const { previewResult } = data;

      this.previewResult = previewResult;
      this.amount = Number(previewResult.paymentAmount).toFixed(2);
      this.newScheduleItemTransactionId =
        previewResult.preview.newScheduleItemTransactionId;
    },
    setPaymentType(paymentType: string) {
      this.paymentType = paymentType;
    },
    async onDateSelected(date: Date) {
      const { data } = await adminDashboardRequests.getPaymentPreview(
        this.screenTrackingId,
        {
          amount: this.amountToNumber,
          paymentDate: moment(date).startOf("day").toDate(),
        }
      );
      const { previewResult } = data;

      this.previewResult = previewResult;
      this.amount = Number(previewResult.paymentAmount).toFixed(2);
      this.newScheduleItemTransactionId =
        previewResult.preview.newScheduleItemTransactionId;
    },
    changeFormat(value: Date) {
      if (value) {
        return moment(String(value)).format("MM/DD/YYYY");
      }
    },
    onAmountKeyDown() {
      this.isPayoff = false;
      this.isMonthlyPayment = false;
    },
    async amendPayment() {
      try {
        this.isLoading = true;
        await adminDashboardRequests.amendPayment(this.screenTrackingId, {
          paymentMethodToken: this.selectedCard,
          amount: this.amountToNumber,
          paymentDate: this.parsedPaymentDate,
        });
        this.isLoading = false;
        await this.$swal({
          title: "Success!",
          text: this.isPaymentToday
            ? "Payment successfully submitted."
            : `Payment sucessfully scheduled to ${moment(this.paymentDate)
                .startOf("day")
                .format("MM/DD/YYYY")}`,
          icon: "success",
        });

        this.modal = false;
        this.previewPaymentComponent = false;
        this.previewNewScheduleComponent = false;
        this.$emit("reloadPage");
      } catch (error) {
        const errorMessage = await errorHandler(error, this.$router);
        if (errorMessage) {
          await this.$swal({
            title: "Errors",
            text: `${this.type}\n`,
            icon: "error",
          });
        }

        this.isLoading = false;
        this.modal = false;
        this.previewPaymentComponent = false;
        this.previewNewScheduleComponent = false;
      }
    },
    // async submitPayment() {
    //   try {
    //     //moment(scheduleItem.date).startOf('day').isBefore(this.paymentDate) &&

    //    this.previewResult.preview.paymentSchedule.forEach(async (scheduleItem: IPaymentScheduleItem) => {

    //       const isEarlyPayment = moment(scheduleItem.date).isSameOrBefore(
    //       moment(this.paymentManagement.nextPaymentSchedule),
    //       'day',
    //     ) &&
    //     moment(scheduleItem.date).isSameOrBefore(
    //       moment(this.paymentManagement.nextPaymentSchedule),
    //       'day',
    //     );
    //       await this.$swal({
    //       title: "Success!",
    //       text: this.isPaymentToday
    //         ? "Payment successfully submitted."
    //         : `PSK Payment sucessfully scheduled to\n\n\n ${scheduleItem.date} \n]\n`,
    //       icon: "success",
    //     });
    //     });
    //     // this.isLoading = true;
    //     // await adminDashboardRequests.submitPayment(this.screenTrackingId, {
    //     //   paymentMethodToken: this.selectedCard,
    //     //   amount: this.amountToNumber,
    //     //   paymentDate: this.parsedPaymentDate,
    //     // });
    //     // this.isLoading = false;

    //     // this.modal = false;
    //     // this.previewPaymentComponent = false;
    //     // this.previewNewScheduleComponent = false;
    //     // this.$emit("reloadPage");
    //   } catch (error) {
    //     const errorMessage = await errorHandler(error, this.$router);
    //     if (errorMessage) {
    //       await this.$swal({
    //         title: "Error",
    //         text: `${errorMessage}`,
    //         icon: "error",
    //       });
    //     }

    //     this.isLoading = false;
    //     this.modal = false;
    //     this.previewPaymentComponent = false;
    //     this.previewNewScheduleComponent = false;
    //   }
    // },
  },

  async mounted() {
    const { data: paymentPreviewData } =
      await adminDashboardRequests.getPaymentPreview(this.screenTrackingId, {
        paymentDate: this.parsedPaymentDate,
      });
    const { previewResult } = paymentPreviewData;

    this.previewResult = previewResult;
    //this.previewResults= previewResult;
    this.amount = Number(previewResult.paymentAmount).toFixed(2);
    this.newScheduleItemTransactionId =
      previewResult.preview.newScheduleItemTransactionId;
    this.scheduleIndex = previewResult.preview.scheduleIndex;

    const { data } = await adminDashboardRequests.getUserCards(
      this.screenTrackingId
    );
    this.reloadPage();
    if (data && data.length > 0) {
      this.userCards = data.filter(
        (card: any) => !isCardExpired(card.cardExpiration)
      );
      this.selectedCard = data.find(
        (card: any) => card.isDefault
      ).paymentMethodToken;
    }
  },
});
</script>

<style scoped>
button {
  font-weight: bold;
  border: 0;
  min-width: 150px;
  border-radius: 30px;
  padding: 10px;
}
button:focus {
  outline: none;
}

.make-payment-btn {
  font-weight: bold;
  border: 0;
  min-width: 150px;
  border-radius: 30px;
  padding-left: 20px;
  border: 1px solid #000;
}
.make-payment-btn-primary {
  background-color: #ea4c89;
  color: white;
  border: 2px solid #ea4c89;
}

.primary {
  background-color: #ea4c89;
  color: white;
}

.secondary {
  background-color: white;
  color: #ea4c89;
  border: 1px solid #ea4c89;
}

.row {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.ico {
  display: block;
  height: 32px;
  width: 32px;
  border: 2px solid #fff;
  border-radius: 16px;
  margin: 3px 4px 3px 20px;
}

.text-right {
  text-align: right;
}
.text-left {
  text-align: left;
}

table {
  width: 100%;
  border: 1px solid #000;
}
td {
  border: 1px solid #000;
  padding: 10px;
}
th {
  border: 1px solid #000;
  padding: 10px;
}
tr > :first-child {
  font-weight: bold;
}

.paid {
  background-color: #a1e1e4;
}

.amount-error {
  padding-top: 8px;
  display: block;
  font-size: 0.6rem;
}

.amount-input-error {
  border: 2px solid #dc3545;
}
</style>

