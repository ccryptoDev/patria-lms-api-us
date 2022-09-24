<template>
  <Layout v-if="approvedUpTo" :steps="true" :login="true">
    <div id="show-offer">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-sm-12">
            <div class="page-main-title">
              Congratulations!<br />
              <span v-if="approvedUpTo" class="smaller"
                >You're Pre-qualified For Up To
                {{ approvedUpTo | currency }}</span
              >
            </div>

            <div class="page-subtitle">
              Calculate &amp; Select Your Plan
            </div>
          </div>
        </div>

        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <b-form
            autocomplete="off"
            @submit.stop.prevent="handleSubmit(onSubmit)"
          >
            <div class="row justify-content-center">
              <div class="col-md-6 col-sm-12">
                <b-form-group
                  label="Amount Requested"
                  label-for="amountRequested"
                  label-align="center"
                >
                  <span class="bigDollar"></span>
                  <ValidationProvider
                    name="Amount Requested"
                    :rules="{ required: true }"
                  >
                    <b-form-input
                      id="requestedAmount"
                      class="mb-0 loanFont"
                      v-model="amountRequested"
                      v-mask="amountRequestedMask"
                      @keyup="getOffersLayout()"
                      :state="getRequestedAmountValidationState"
                      aria-describedby="requestedAmount-feedback"
                    ></b-form-input>

                    <b-form-invalid-feedback id="requestedAmount-feedback"
                      >Amount requested must be betwen
                      {{ minimumRequestAmount | currency }} and
                      {{ approvedUpTo | currency }}</b-form-invalid-feedback
                    >
                  </ValidationProvider>
                  <br />
                  <button
                    type="button"
                    style="margin-left: 0px !important;"
                    class="btn btn-primary btn-lg btn-black ml-2"
                    :disabled="
                      amountRequested &&
                        minimumRequestAmount &&
                        amountRequested < minimumRequestAmount
                    "
                    @click="() => getOffersLayout()"
                  >
                    CALCULATE
                  </button>
                </b-form-group>
              </div>
            </div>

            <div class="row justify-content-center mb-5">
              <div class="col-md-12">
                <div class="terms-list">
                  <div
                    class="single-term"
                    :class="{
                      'term-selected': selectedTerm === offer.term,
                      'term-gray': selectedTerm && selectedTerm !== offer.term,
                    }"
                    v-for="offer in offers"
                    :key="offer.term"
                  >
                    <div class="term-info">
                      <div v-if="selectedTerm === offer.term">
                        <div
                          class="term-select"
                          @click.prevent="selectTerm(offer), setAutoPay(offer)"
                        >
                          <h4 class="title-selected">
                            {{ offer.title
                            }}<font-awesome-icon icon="check-circle" />
                          </h4>
                        </div>
                      </div>

                      <div v-else>
                        <div
                          class="term-select"
                          @click.prevent="selectTerm(offer), setAutoPay(offer)"
                        >
                          <h4>{{ offer.title }}</h4>
                        </div>
                      </div>

                      <div
                        class="term-body"
                        @click.prevent="selectTerm(offer), setAutoPay(offer)"
                      >
                        <div v-if="!selectedTerm === offer.term">
                          <p>
                            <font-awesome-icon
                              :icon="['far', 'check-circle']"
                              class="offerCheck"
                            />Fixed APR of {{ offer.apr }}%
                            {{ offer.promoTerm }} months
                          </p>

                          <p v-if="offer.downPayment" v-cloak>
                            <font-awesome-icon
                              :icon="['far', 'check-circle']"
                              class="offerCheck"
                            />Plus {{ offer.downPayment | currency }} down
                            payment
                          </p>

                          <p>
                            <font-awesome-icon
                              :icon="['far', 'check-circle']"
                              class="offerCheck"
                            />{{ offer.promoTerm }} month deferred interest if
                            paid in full
                          </p>
                        </div>

                        <div v-else>
                          <p>
                            <font-awesome-icon
                              :icon="['far', 'check-circle']"
                              class="offerCheck"
                            />Fixed APR of {{ offer.apr }}% for
                            {{ offer.term }} months
                          </p>

                          <p v-if="offer.downPayment" v-cloak>
                            <font-awesome-icon
                              :icon="['far', 'check-circle']"
                              class="offerCheck"
                            />plus {{ offer.downPayment | currency }} down
                            payment
                          </p>

                          <p>
                            <font-awesome-icon
                              :icon="['far', 'check-circle']"
                              class="offerCheck"
                            />{{ offer.promoTerm }} month deferred interest if
                            paid in full
                          </p>
                        </div>
                      </div>

                      <div
                        class="term-footer"
                        @click.prevent="selectTerm(offer), setAutoPay(offer)"
                      >
                        <div class="term-price" v-cloak>
                          <p>
                            <span class="dollar">{{
                              offer.monthlyPayment | currencyWithoutSign
                            }}</span>
                          </p>
                        </div>
                      </div>

                      <div
                        class="term-apr"
                        @click.prevent="selectTerm(offer), setAutoPay(offer)"
                      >
                        <p>MINIMUM MONTHLY PAYMENT</p>
                        <p>FOR {{ offer.term }} MONTHS</p>
                      </div>

                      <div
                        v-if="selectedTerm === offer.term && promo === false"
                        class="term-autoPay"
                      >
                        <button
                          type="button"
                          :disabled="parsedAmountRequested > approvedUpTo"
                          @click.prevent="setAutoPayTrue(offer)"
                          class="btn btn-primary btn-lg submit-form-lg term-autoPayButton"
                        >
                          Pick Your AutoPay Plan
                        </button>
                        <div
                          v-if="offer.downPayment"
                          style="display: none"
                        >
                        </div>
                        <div v-else>
                          <a id="enroll" @click.prevent="onSubmit(true)"
                            >Enroll to this plan &amp; skip AutoPay</a
                          >
                        </div>
                      </div>

                      <div
                        v-if="selectedTerm === offer.term && promo === true"
                        class="term-autoPay"
                      >
                        <h4>Set AutoPay</h4>
                        <p id="chooseAmount">
                          Please choose an AutoPay amount
                        </p>
                        <div>
                          <input
                            type="radio"
                            :checked="selectChecked(offer)"
                            class="checkPromoRadio"
                            name="re"
                            v-on:click="selectPromo(false)"
                          />
                          <div class="testPromo"></div>
                          <p class="promoSelect">
                            <label
                              for="noPromoAmount"
                              style="margin-bottom: 0px"
                            >
                              <span class="dollar"
                                >{{
                                  offer.monthlyPayment | currencyWithoutSign
                                }}
                              </span>
                              for {{ offer.term }} months</label
                            >
                          </p>
                        </div>
                        <input
                          type="radio"
                          class="checkPromoRadio"
                          :checked="selectChecked1(offer)"
                          name="re"
                          v-on:click="selectPromo(true)"
                        />
                        <div class="testPromo"></div>
                        <p class="promoSelect">
                          <label for="PromoAmount"
                            ><span class="dollar">{{
                              offer.promoMonthlyPayment | currencyWithoutSign
                            }}</span>
                            for {{ offer.promoTerm }} months</label
                          >
                        </p>
                        <button
                          type="submit"
                          class="btn btn-primary btn-lg submit-form-lg term-autoPayButton"
                        >
                          Confirm
                        </button>
                        <div
                          v-if="offer.downPayment"
                          style="display: none"
                        ></div>
                        <div v-else>
                          <a id="enroll" @click.prevent="onSubmit(true)"
                            >Enroll to this plan &amp; skip AutoPay</a
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </b-form>
        </ValidationObserver>
      </div>
    </div>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";
import { mapState, mapMutations } from "vuex";
import createNumberMask from "text-mask-addons/dist/createNumberMask";

import Layout from "@/user-application/layout/pages/Layout.vue";

import { getApplicationData } from "@/user-application/application/api";
import { getOffers, saveOffer } from "@/user-application/offers/api";

import showErrorToast from "@/helpers/errorToast";
import IOffer from "../types/IOffer";

const amountRequestedMask = createNumberMask({
  prefix: "",
  allowDecimal: true,
  includeThousandsSeparator: true,
  allowNegative: false,
  integerLimit: 4,
});

export default Vue.extend({
  components: {
    Layout,
  },

  data() {
    return {
      approvedUpTo: null as null | number,
      isSubmitting: false,
      minimumRequestAmount: null as null | number,
      offers: [] as any[],
      promo: false,
      amountRequested: null as null | string,
      amountRequestedMask,
      selectedOffer: {} as Record<string, unknown>,
      selectedOffer1: {} as Record<string, unknown>,
      selectedOfferId: null as null | string,
      selectedTerm: null as null | number,
      titles: ["StretchPlan", "PlusPlan", "SpeedPlan"],
    };
  },

  computed: {
    ...mapState({
      requestedAmount: (state: any) => state.user.requestedAmount,
    }),
    parsedAmountRequested(): number {
      if (typeof this.amountRequested === "string") {
        return +this.amountRequested.replace(/[$,]/g, "");
      } else {
        return 0;
      }
    },
    getRequestedAmountValidationState() {
      const requestedAmount = this.parsedAmountRequested;
      if (!(this.minimumRequestAmount && this.approvedUpTo)) {
        return null;
      }
      if (
        requestedAmount < this.minimumRequestAmount ||
        requestedAmount > this.approvedUpTo
      ) {
        return false;
      }

      return true;
    },
  },

  methods: {
    ...mapMutations(["setStep", "setIsLoading"]),
    async getOffersLayout(requestedLoanAmount?: number) {
      
      if (!requestedLoanAmount) {
        requestedLoanAmount = this.parsedAmountRequested;
      }
      if(requestedLoanAmount && requestedLoanAmount.toString().length == 4){
      try {
        const { data } = await getOffers(requestedLoanAmount);
        const { approvedUpTo, minimumAmount, offers , status } = data;
        // const offers1 :any[] = [];
        // let x = 0;
        // if(offers.length > 0){
        //   for (x = 0; x < offers.length; x++){
        //   if(x == 0){
        //     offers1.push(offers[x]);
        //   }
        //   else{
        //     if(offers1[x - 1].term == offers[x].term){
        //       console.log("");
        //     }else{
        //       offers1.push(offers[x]);
        //     }
        //   }
        // }
        // }
        
        if (status === "declined") {
          await this.$router.push({ name: "denied" });
        } else {
          const parsedRequestAmount = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
          })
            .format(requestedLoanAmount)
            .replace(/[$USD]/g, "");
          this.amountRequested = parsedRequestAmount;
          this.approvedUpTo = approvedUpTo;
          this.minimumRequestAmount = minimumAmount;
          this.offers = offers
            .slice()
            .reverse()
            .map(
              (
                offer: IOffer & { showOffers: boolean; title: string },
                index: number
              ) => {
                if (offer.canUsePromo) {
                  offer.promoSelected = false;
                }

                offer.showOffers = false;
                offer.title = this.titles[index];

                return offer;
              }
            );
        }
      } catch (error) {
        this.isSubmitting = false;
        let errorMessage = "";

        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = error.message;
        }
        if(errorMessage != "Bad Request"){
          showErrorToast(this, "error", errorMessage);
        }
        
      }
      }
    },
    selectChecked(offer: IOffer){
      if(this.selectedOffer1 != null){
      if(offer.loanId == this.selectedOffer1.loanId){
        if(this.selectedOffer1.promoSelected == false){
          return true;
        }else{
          return false;
        }
      }else{
        return true;
      }
    }else{
      return true;
    }
    },
    selectChecked1(offer: IOffer){
      if(this.selectedOffer1 != null){
      if(offer.loanId == this.selectedOffer1.loanId){
        if(this.selectedOffer1.promoSelected == true){
          return true;
        }else{
          return false;
        }
      }else{
        return false;
      }
      }else{
        return false;
      }
    },
    selectPromo(promo: boolean) {
      if (promo) {
        this.selectedOffer.promoSelected = true;
      } else {
        this.selectedOffer.promoSelected = false;
      }
    },
    selectOffer(offer: IOffer, promoSelected: boolean) {
      this.selectedOfferId = offer.loanId;
      this.selectedOffer = { ...offer };
      this.selectedOffer.promoSelected = promoSelected;
      this.selectedTerm = offer.term;
      this.offers = this.offers.map((offerObj) => {
        if (offerObj.term === offer.term) {
          offerObj.promoSelected = promoSelected;
        }
        return offerObj;
      });
    },
    selectTerm(offer: IOffer) {
      
      if (this.selectedTerm !== offer.term) {
        this.selectedOfferId = null;
        this.selectedOffer = {};
      }
      this.selectedTerm = offer.term;
      if (!Object.keys(this.selectedOffer).length)
        this.selectOffer(offer, offer.promoSelected);
    },
    setAutoPay(offer: IOffer) {
      if (this.selectedTerm === offer.term) {
        this.promo = false;
      }
    },
    setAutoPayTrue(offer: IOffer) {
      if (this.selectedTerm === offer.term) {
        this.promo = true;
      }
    },

    async onSubmit(skipAutoPay = false) {
      this.isSubmitting = true;
      this.setIsLoading(true);

      try {
        const requestBody = {
          skipAutoPay,
          loanId: this.selectedOffer.loanId as string,
          promoSelected: this.selectedOffer.promoSelected as boolean,
        };

        await saveOffer(requestBody);
        this.isSubmitting = false;
        this.setIsLoading(false);

        await this.$router.push({ name: "reviewOffer" });
      } catch (error) {
        this.setIsLoading(false);
        this.isSubmitting = false;
        let errorMessage = "";

        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = error.message;
        }

        showErrorToast(this, "error", errorMessage);
      }
    },
    toggleOpened(offer: IOffer) {
      this.offers = this.offers.map((offerObj) => {
        if (offerObj.term !== offer.term) {
          offerObj.showOffers = false;
        } else {
          offerObj.showOffers = !offerObj.showOffers;
        }

        return offerObj;
      });
    },
  },

  async created() {
    try {
      const { data } = await getApplicationData();
      const { isCompleted, lastStep, requestedAmount, selectedOffer } = data;

      if (isCompleted) {
        await this.$router.push({ name: "userDashboard" });
      } else if (lastStep !== "offers") {
        await this.$router.push({ name: lastStep });
      } else {
        this.setStep(2);
        this.selectedOffer1 = selectedOffer;
        await this.getOffersLayout(requestedAmount);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        await this.$router.push({ name: "userLogin" });
      } else {
        showErrorToast(this, "error", error.message);
      }
    }
  },

  async mounted() {
    const allRadios = document.getElementsByName("re");
    let booRadio: any;
    let x = 0;
    for (x = 0; x < allRadios.length; x++) {
      (allRadios[x] as any).onclick = function() {
        if (booRadio === this) {
          this.checked = false;
          booRadio = null;
        } else {
          booRadio = this;
        }
      };
    }
  },
});
</script>

<style scoped>
#requestedAmount {
  outline: 0 !important;
  border-width: 0 0 1px;
  border-color: #dadada;
  width: 300px;
  font-size: 35px;
  font-weight: 600;
  margin: 0 auto 30px auto;
  display: inline-block;
}
#requestedAmount:focus {
  outline: none;
  box-shadow: none;
}
</style>