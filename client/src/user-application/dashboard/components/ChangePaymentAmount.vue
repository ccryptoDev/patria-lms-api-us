<template>
  <div v-if="regularAmount < payoffAmount">
    <button class="button primary" @click="onChangeAmount">
      Select Payment Plan
    </button>
    <VueFinalModal v-model="modal" classes="share-modal-container" content-class="share-modal-content"
      :clickToClose="false">
      <div v-if="modal">
        <h3>Change Payment Amount</h3>
        <div class="container" style="width: 35vw;">
          <b-form @submit.prevent="onSubmit">
            <div class="row">
              <div @click="setPaymentAmount('regular')" style="margin-right: 10px; ">
                <div>
                  Regular Amount
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                  class="payment-amount-btn" :class="{ 'payment-amount-btn-primary': isRegularAmount }">
                  <div>
                    {{ regularAmount | currency }}
                  </div>
                  <div class="ico">
                    <i v-show="isRegularAmount" class="fa fa-check" style="vertical-align: middle;"></i>
                  </div>
                </div>
              </div>
              <!-- <div
                @click="setPaymentAmount('promo')"
                style="margin-left: 10px;"
              >
                <div>Promo Amount</div>
                <div
                  style="display: flex; justify-content: space-between; align-items: center; cursor: pointer;"
                  class="payment-amount-btn"
                  :class="{ 'payment-amount-btn-primary': isPromoAmount }"
                >
                  <div v-if="payoffAmount < promoAmount">
                    {{ payoffAmount | currency }}
                  </div>
                  <div v-else>
                    {{ promoAmount | currency }}
                  </div>
                  <div class="ico">
                    <i
                      v-show="isPromoAmount"
                      class="fa fa-check"
                      style="vertical-align: middle;"
                    ></i>
                  </div>
                </div>
              </div> -->
            </div>
            <span v-if="error" class="text-danger amount-error" style="display: block;">{{ error }}</span>
            <hr />
            <div class="row" style="float: middle; margin-top: 20px">

              <button class="secondary" type="button" @click="onCancel" style="margin-right: 10px;">
                Cancel
              </button>
              <button type="submit" :disabled="!isValidAmount || isLoading" style="margin-left: 10px;">
                <span>Confirm</span>
                <b-spinner small v-show="isLoading"></b-spinner>
              </button>
            </div>
          </b-form>
        </div>
      </div>
    </VueFinalModal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import createNumberMask from "text-mask-addons/dist/createNumberMask";
import { changePaymentAmount } from "@/user-application/dashboard/api";
import { errorHandler } from "@/api/error-handler";

const currencyMask = createNumberMask({
  prefix: "$",
  allowDecimal: true,
  includeThousandsSeparator: true,
  allowNegative: false,
  integerLimit: 4,
});

export default Vue.extend({
  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
    regularAmount: {
      required: true,
      type: Number,
    },
    promoAmount: {
      required: false,
      type: Number,
    },
    currentAmount: {
      required: true,
      type: Number,
    },
    payoffAmount: {
      required: true,
      type: Number,
    },
  },

  data() {
    return {
      amount: "" as number | string,
      error: "",
      isLoading: false,
      isPromoAmount: false,
      isRegularAmount: false,
      isValidAmount: true,
      mask: currencyMask,
      modal: false,
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
  },

  methods: {
    onChangeAmount() {
      this.modal = true;
      this.isRegularAmount = true;
      this.amount = "" + this.regularAmount;
      if (this.currentAmount == this.regularAmount) {
        this.isRegularAmount = true;
        this.isPromoAmount = false;
        this.amount = "" + this.regularAmount;
      } else {
        this.isPromoAmount = true;
        this.isRegularAmount = false;
        this.amount = "" + this.promoAmount;
      }
    },
    onCancel() {
      this.isValidAmount = true;
      this.error = "";
      //this.amount = "" + this.regularAmount;
      this.isLoading = false;
      this.modal = false;
    },
    setPaymentAmount(loanType: string) {
      if (loanType === "regular") {
        this.isRegularAmount = true;
        this.isPromoAmount = false;
        this.amount = "" + this.regularAmount;
      } else {
        this.isRegularAmount = false;
        this.isPromoAmount = true;
        this.amount =
          this.payoffAmount < this.promoAmount
            ? "" + this.payoffAmount
            : "" + this.promoAmount;
      }
    },
    onAmountBlur(event: any) {
      const { value } = event.target;
      if (this.error) {
        this.error = "";
      }

      if (typeof value === "string") {
        const parsedAmount = parseFloat(value.replace(/[$,]/g, ""));
        this.isValidAmount =
          parsedAmount < this.regularAmount || parsedAmount > this.payoffAmount
            ? false
            : true;
        if (!this.isValidAmount) {
          this.error = `Amount must be higher than ${this.regularAmount} and lower than ${this.payoffAmount}`;
        }
      } else {
        this.isValidAmount =
          value < this.regularAmount || value > this.payoffAmount
            ? false
            : true;
        if (!this.isValidAmount) {
          this.error = `Amount must be higher than ${this.regularAmount} and lower than ${this.payoffAmount}`;
        }
      }
    },
    onAmountKeyDown() {
      this.isRegularAmount = false;
      this.isPromoAmount = false;
    },
    async onSubmit() {
      if (this.amountToNumber === this.currentAmount) {
        this.error = "Payment amount has not changed";
        return;
      }
      const amount = this.amountToNumber;
      try {
        this.isLoading = true;
        const requestBody = {
          screenTracking: this.screenTrackingId,
          amount: amount
        };
        await changePaymentAmount(requestBody);
        this.isLoading = false;
        await this.$swal({
          title: "Success!",
          text: "Payment amount successfully changed.",
          icon: "success",
        });

        this.error = "";
        this.isRegularAmount = true;
        this.isPromoAmount = false;
        this.modal = false;
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

        this.error = "";
        this.isLoading = false;
        this.modal = false;
      }
    },
  },
});
</script>

<style scoped>
.payment-amount-btn {
  font-weight: bold;
  border: 0;
  min-width: 150px;
  border-radius: 30px;
  padding-left: 20px;
  border: 1px solid #000;
}

.payment-amount-btn-primary {
  background-color: #ea4c89;
  color: white;
  border: 2px solid #ea4c89;
}

.ico {
  display: block;
  height: 32px;
  width: 32px;
  border: 2px solid #fff;
  border-radius: 16px;
  margin: 3px 4px 3px 20px;
}

.button {
  background-color: #ea4c89;
  color: #fff;
}

button:focus {
  outline: none;
}
</style>
