<template>
  <div>
    <!-- <div style="text-align: right;" @click="showPreviewPayment">
      <button class="primary" style="margin-right: 10px;">
        Make Payment
      </button>
    </div> -->
    <div class="tooltipvueleft" @click="showPreviewPayment">
      <button class="primary" style="margin-right: 10px">Make Payment</button>
      <span class="tooltiptextleft">Can Make Payment</span>
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
        style="width: 35vw;height: 600px;overflow:auto;"
      >
        <h3>Make Payment</h3>
        <ValidationObserver v-slot="{ invalid }">
          <form @submit="onNext">
            <div class="row">
              <div
                @click="setPaymentType('regular')"
                style="margin-right: 10px; "
              >
                <div>
                  Suggested Payment
                </div>
                <div
                  style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                  class="make-payment-btn"
                  :class="{ 'make-payment-btn-primary': isMonthlyPayment }"
                  @click="toggleMonthlyPayment"
                >
                  <div>
                    {{ suggestedPaymentAmount | currency }}
                  </div>
                  <div class="ico">
                    <font-awesome-icon
                      v-show="isMonthlyPayment"
                      icon="check"
                      style="vertical-align: middle;"
                    />
                  </div>
                </div>
              </div>
              <div @click="setPaymentType('payoff')" style="margin-left: 10px;">
                <div>Payoff</div>
                <div
                  style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                  class="make-payment-btn"
                  :class="{ 'make-payment-btn-primary': isPayoff }"
                  @click="togglePayoff"
                >
                  <div>
                    {{ payoffAmount | currency }}
                  </div>
                  <div class="ico">
                    <font-awesome-icon
                      v-show="isPayoff"
                      icon="check"
                      style="vertical-align: middle;"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div style="margin-right: 10px; width: 48%;">
                <label>Payment Date</label>
                <div>
                  <Datepicker
                    v-model="paymentDate"
                    @selected="onDateSelected"
                    :disabled-dates="disabledDates"
                    :format="'MM/dd/yyyy'"
                    :input-class="'w-100 form-control'"
                  />
                </div>
              </div>
              <div style="margin-left: 10px; width: 48%;">
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
                      style="width: 100%;"
                      @blur="onAmountBlur"
                      @keydown="onAmountKeyDown"
                    />
                    <span
                      class="text-danger amount-error"
                      style="display: block;"
                      >{{ errors[0] }}</span
                    >
                  </ValidationProvider>
                </div>
              </div>
            </div>
            <div class="row">
              <div style="width: 100%;">
                <div v-if="allPaymentMethods && allPaymentMethods.length > 0">
                  <!-- <label>Debit Card/Credit Card</label> -->
                  <label>Bank Accounts</label>
                  <div>
                    <select
                      v-model="selectedCard"
                      class="form-control"
                      @change="onSelectPaymentMethod($event)"
                    >
                      <option
                        v-for="card in allPaymentMethods"
                        :key="card.paymentMethodToken"
                        :value="card._id"
                      >
                        {{ showAccountList(card) }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <!-- <div class="row">
              <p>Payments will be applied fully to outstanding amounts.</p>
            </div>
            <div class="row">
              <table style="margin-bottom: 15px;">
                <tbody>
                  <tr>
                    <td class="text-left">Payment</td>
                    <td style="width: 215px;" class="text-right" colspan="3">
                      {{ previewResult.paymentAmount | currency }}
                    </td>
                  </tr>
                  <tr>
                    <td></td>
                    <td style="width: 120px;">Now</td>
                    <td style="width: 120px;">Payment</td>
                    <td style="width: 120px;">After</td>
                  </tr>
                  <tr>
                    <td class="text-left">Accrued Interest</td>
                    <td colspan="3" style="text-align: right;">
                      {{ previewResult.preview.accruedInterest | currency }}
                    </td>
                  </tr>
                  <tr
                    v-if="
                      previewResult.preview.accruedBalance.unpaidInterest > 0
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
                        previewResult.preview.accruedBalance.unpaidInterest
                          | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120;">
                      {{
                        previewResult.preview.paymentBalance.unpaidInterest
                          | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120;">
                      {{
                        previewResult.preview.unpaidBalance.unpaidInterest
                          | currency
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">Interest Balance</td>
                    <td class="text-right" style="width: 120;">
                      {{
                        previewResult.preview.accruedBalance.interest | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120;">
                      {{
                        previewResult.preview.paymentBalance.interest | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120;">
                      {{
                        previewResult.preview.unpaidBalance.interest | currency
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td class="text-left">Principal Balance</td>
                    <td class="text-right" style="width: 120;">
                      {{
                        previewResult.preview.accruedBalance.principal
                          | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120;">
                      {{
                        previewResult.preview.paymentBalance.principal
                          | currency
                      }}
                    </td>
                    <td class="text-right" style="width: 120px;">
                      {{
                        previewResult.preview.unpaidBalance.principal | currency
                      }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div> -->
            <div class="row">
              <button
                @click="hidePreviewPayment"
                class="secondary"
                style="margin-right: 10px;"
              >
                Cancel
              </button>
              <button
                :disabled="invalid"
                type="submit"
                class="primary"
                style="margin-left: 10px;"
              >
                Next
              </button>
            </div>
          </form>
        </ValidationObserver>
      </div>
      <div v-if="previewNewScheduleComponent">
        <h3>Confirm Payment</h3>
        <!-- <p>preview of remaining payment schedule</p> -->
        <div style="height: 13vh; overflow: auto;">
          <!-- <table style="overflow: auto; ">
            <tbody>
              <tr>
                <th class="primary">Date</th>
                <th class="primary">Balance</th>
                <th class="primary">Payment</th>
                <th class="primary">Fees</th>
                <th class="primary">Interest</th>
                <th class="primary">Principal</th>
              </tr>
              <tr v-for="paymentScheduleItem in paymentScheduleLeft" :key="paymentScheduleItem.month" :class="{
                paid:
                  paymentScheduleItem.transactionId ===
                  newScheduleItemTransactionId,
              }">
                <td class="text-left">
                  {{ paymentScheduleItem.date | date }}
                </td>
                <td class="text-left">
                  {{ paymentScheduleItem.startPrincipal | currency }}
                </td>
                <td class="text-left">
                  {{ paymentScheduleItem.amount | currency }}
                </td>
                <td class="text-left">
                  {{ paymentScheduleItem.fees | currency }}
                </td>
                <td class="text-left">
                  {{
                  (paymentScheduleItem.interest +
                  paymentScheduleItem.pastDueInterest)
                  | currency
                  }}
                </td>
                <td class="text-left">
                  {{ paymentScheduleItem.principal | currency }}
                </td>
              </tr>
            </tbody>
          </table> -->
          <div style="margin-top: 15px;">
            <button
              @click="goToPreviewPayment"
              class="secondary"
              style="margin-right: 10px;"
            >
              Back
            </button>
            <button
              @click="submitPayment"
              style="margin-left: 10px;"
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
    const isLowerThanOne = parseFloat(parsedAmount) < 5;
    if (isLowerThanOne) {
      return "Amount must be greater than $5.00";
    }
    return true;
  } else {
    if (value < 1) {
      return "Amount must be greater than $5.00";
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
    Datepicker,
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
      makePaymentMethodVia: null as null | string,
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
      bankAccounts: [] as any[],
      selectedCard: "",
      paymentManagement: [] as any,
      amount: "",
      newScheduleItemTransactionId: "",
      paymentType: "regular",
      paymentDate: new Date(),
      isLoading: false,
      mask: currencyMask,
      val: false,
      allPaymentMethods: [] as any,
      disabledDates: {
        to: moment()
          .startOf("day")
          .toDate(),
        from: moment()
          .add(1, "months")
          .startOf("day")
          .toDate(),
      },
      payoffAmount: 0,
      suggestedPaymentAmount: 0,
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
      return moment(this.paymentDate)
        .startOf("day")
        .toDate();
    },
    paymentScheduleLeft(): any[] {
      const response = this.previewResult.preview.paymentSchedule.filter(
        (scheduleItem: any) => scheduleItem.status === "opened"
      );
      return response;
    },
  },

  methods: {
    async onNext() {
      //this.showPopup();
      //if(this.val != true){
      this.goToNewSchedule();
      //}
    },
    onSelectPaymentMethod(event: any) {
      this.makePaymentMethodVia = event.target?.value;
    },
    showAccountList(data: any) {
      let value = null;
      if (data?.paymentType === "ACH") {
        value = `${data.bankName} - ********${data.accountNumber
          .split("")
          .reverse()
          .slice(0, 4)
          .join("")}`;
      } else {
        value = `${data.nameOnCard} - ${data.cardNumberLastFour}`;
      }
      return value;
    },
    async showPopup() {
      await this.$swal({
        title: "Error",
        text: `${this.val}`,
        icon: "error",
      });
    },
    async reloadPage() {
      try {
        const { data } = await adminDashboardRequests.getPaymentManagement(
          this.screenTrackingId
        );
        this.paymentManagement = data.response;
        const today = moment()
          .startOf("day")
          .toDate();
        if (
          moment(this.paymentManagement.nextPaymentSchedule).isBefore(
            moment(today),
            "day"
          )
        ) {
          this.val = true;
          this.disabledDates = {
            to: moment()
              .startOf("day")
              .toDate(),
            from: moment()
              .add(1, "months")
              .startOf("day")
              .toDate(),
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

      const { data } = await adminDashboardRequests.getPaymentPreview(
        this.screenTrackingId,
        { amount: parsedAmount, paymentDate: this.parsedPaymentDate }
      );
      const { previewResult } = data;

      this.amount = Number(previewResult.paymentAmount).toFixed(2);

      this.newScheduleItemTransactionId =
        previewResult.preview.newScheduleItemTransactionId;
      this.previewResult = previewResult;
      this.previewResults = previewResult;
    },
    goToNewSchedule() {
      this.previewPaymentComponent = false;
      this.previewNewScheduleComponent = true;
    },
    async showPreviewPayment() {
      this.modal = true;
      // if (!this.userCards || this.userCards.length <= 0) {
      //   await this.$swal({
      //     title: "Error",
      //     text: "User didn't add a card yet",
      //     icon: "error",
      //   });
      //   this.modal = false;
      //   return;
      // }

      this.previewPaymentComponent = true;

      const { data } = await adminDashboardRequests.getPaymentPreview(
        this.screenTrackingId,
        { paymentDate: this.parsedPaymentDate }
      );
      const { previewResult } = data;

      this.suggestedPaymentAmount =
        previewResult.ledger.delinquentAmount || previewResult.paymentAmount;
      this.amount = Number(this.suggestedPaymentAmount).toFixed(2);

      this.newScheduleItemTransactionId =
        previewResult.preview.newScheduleItemTransactionId;
      this.previewResult = previewResult;
      this.previewResults = previewResult;
    },
    hidePreviewPayment: async function() {
      this.modal = false;
      this.previewPaymentComponent = false;
      this.previewNewScheduleComponent = false;
      this.isMonthlyPayment = true;
      this.isPayoff = false;
      const { data } = await adminDashboardRequests.getUserCards(
        this.screenTrackingId
      );
      const {
        data: userBankAccounts,
      } = await adminDashboardRequests.listUserBanks(this.screenTrackingId);

      this.bankAccounts = userBankAccounts;

      const allPaymentMethods = [...data, ...userBankAccounts];

      if (data && data.length > 0) {
        this.selectedCard = allPaymentMethods.find(
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

      this.suggestedPaymentAmount =
        previewResult.ledger.delinquentAmount || previewResult.paymentAmount;
      this.amount = Number(this.suggestedPaymentAmount).toFixed(2);

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
          paymentDate: moment(date)
            .startOf("day")
            .toDate(),
        }
      );
      const { previewResult } = data;

      this.previewResult = previewResult;
      this.amount = Number(previewResult.paymentAmount).toFixed(2);
      this.newScheduleItemTransactionId =
        previewResult.preview.newScheduleItemTransactionId;
    },
    onAmountKeyDown() {
      this.isPayoff = false;
      this.isMonthlyPayment = false;
    },
    async submitPayment() {
      try {
        this.isLoading = true;
        await adminDashboardRequests.submitPayment(this.screenTrackingId, {
          paymentMethodToken: "",
          amount: this.amountToNumber,
          paymentDate: this.parsedPaymentDate,
          paymentVia: this.makePaymentMethodVia,
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
            title: "Error",
            text: `${errorMessage}`,
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
    const {
      data: paymentPreviewData,
    } = await adminDashboardRequests.getPaymentPreview(this.screenTrackingId, {
      paymentDate: this.parsedPaymentDate,
    });
    const { previewResult } = paymentPreviewData;

    this.previewResult = previewResult;
    this.payoffAmount = paymentPreviewData.payoff;
    this.previewResults = previewResult;
    this.suggestedPaymentAmount =
      previewResult.ledger.delinquentAmount ||
      paymentPreviewData.paymentAmount;
    this.amount = Number(this.suggestedPaymentAmount).toFixed(2);
    this.newScheduleItemTransactionId =
      previewResult.preview.newScheduleItemTransactionId;

    const { data } = await adminDashboardRequests.getUserCards(
      this.screenTrackingId
    );

    const {
      data: userBankAccounts,
    } = await adminDashboardRequests.listUserBanks(this.screenTrackingId);
    this.bankAccounts = userBankAccounts;

    this.reloadPage();
    const allPaymentMethods = [...data, ...userBankAccounts];
    this.allPaymentMethods = allPaymentMethods;
    if (data && data.length > 0) {
      this.userCards = data.filter(
        (card: any) => !isCardExpired(card.cardExpiration)
      );
      this.selectedCard = allPaymentMethods.find(
        (card: any) => card.isDefault
      )._id;
      this.makePaymentMethodVia = this.selectedCard;
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
