<template>
  <Layout
    v-if="screenTracking && user && selectedOffer"
    :steps="true"
    :login="true"
  >
    <div id="contract">
      <div class="container">
        <div class="row justify-content-center" style="margin-bottom: 36px;">
          <div class="col-md-12 col-sm-12 text-center">
            <div class="page-main-title">You've Been Approved!</div>
          </div>
          <div class="page-subtitle-2">
            Congratulations! You've been approved for a
            <strong
              >credit limit of
              {{ screenTracking.approveUpTo | currency }}.</strong
            ><br />
            Your are only responsible to repay the amount you spend during the
            Purchase window.
          </div>
        </div>

        <div class="summary-section">
          <div class="summary-row medium-padding">
            <div class="summary-key" style="min-width: 47%">Applicant</div>
            <div class="summary-value">
              {{ user.fullName }}
            </div>
          </div>
          <div class="summary-row medium-padding">
            <div class="summary-key" style="min-width: 47%">Credit Limit</div>
            <div class="summary-value">
              {{ screenTracking.approveUpTo | currency }}
            </div>
          </div>
          <div class="summary-row medium-padding">
            <div class="summary-key" style="min-width: 47%">Applicant ID</div>
            <div class="summary-value">
              {{ screenTracking.applicationReference }}
            </div>
          </div>
          <div class="summary-row medium-padding">
            <div class="summary-key" style="min-width: 43%">Plan</div>
            <div class="summary-value">
              {{ selectedOffer.promoMonthlyPayment | currency }}/mo -
              {{ selectedOffer.promoTerm }} months deferred interest if paid in
              full
            </div>
          </div>
        </div>

        <div class="selected-offer">
          <div class="selected-offer-item">
            <div class="amount">
              {{ selectedOffer.loanAmount | currency }}
            </div>
            <div class="label">Requested Amount</div>
          </div>
          <div class="selected-offer-item">
            <div class="amount">{{ selectedOffer.term }} Months</div>
            <div class="label">Term</div>
          </div>
          <div class="selected-offer-item">
            <div class="amount">{{ selectedOffer.interestRate }}%</div>
            <div class="label">Interest Rate</div>
          </div>
          <div class="selected-offer-item">
            <div class="amount">
              {{ selectedOffer.monthlyPayment | currency }}
            </div>
            <div class="label">Monthly Payment</div>
          </div>
        </div>

        <div class="ric-container">
          <CA v-if="renderComponent" ref="CA" />
        </div>

        <br />

        <div v-if="!ricSignature">
          <div class="signature-pad-container">
            <div>Please Sign Below:</div>
            <div id="ric-signature-pad" class="signature-pad">
              <canvas height="115" style="width: 100%; height:115px;"></canvas>
            </div>
          </div>
          <div class="signature-buttons">
            <button
              class="btn btn-default btn-sm submit-form-sm clearButton"
              :disabled="isSubmitting"
              @click.prevent="clearSignature"
            >
              CLEAR
            </button>
            <button
              class="btn btn-primary btn-sm submit-form-sm saveButton"
              :disabled="isSubmitting"
              @click.prevent="saveSignature"
            >
              SAVE
            </button>
          </div>
        </div>

        <span class="input-error" v-if="errors.ricSignature" v-cloak>{{
          errors.ricSignature
        }}</span>

        <br />

        <div class="contract-buttons mb-5">
          <button
            class="btn btn-default btn-lg submit-form-lg printSummaryButton"
            :disabled="isSubmitting"
            style="color: #363636 !important;"
            @click.prevent="print"
          >
            Print Summary
          </button>
          <button
            class="btn btn-primary btn-lg submit-form-lg"
            :class="{ finalizeButton: !ricSignature }"
            :disabled="!ricSignature || isSubmitting"
            @click.prevent="finalize"
          >
            Finalize
          </button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";
import { mapMutations } from "vuex";

import SignaturePad from "signature_pad";
import CA from "../components/CA.vue";
import Layout from "@/user-application/layout/pages/Layout.vue";
import { getApplicationData } from "@/user-application/application/api";
import showErrorToast from "@/helpers/errorToast";
import { getOfferData, saveSignature, finalizeApplication } from "../api";

export default Vue.extend({
  components: {
    CA,
    Layout,
  },

  data() {
    return {
      screenTracking: null as null | Record<string, unknown>,
      user: null as null | Record<string, unknown>,
      selectedOffer: null as null | Record<string, unknown>,
      eftaAgreement: false,
      errors: {} as Record<string, unknown>,
      isSubmitting: false,
      renderComponent: false,
      ricSignature: false,
      showEfta: false,
      signaturePad: null as any,
    };
  },

  methods: {
    ...mapMutations([
      "setStep",
      "setProvider",
      "setPaymentScheduleInfo",
      "setSelectedOffer",
      "setUserData",
      "setDate",
      "setScreenTracking",
      "setSignature",
      "setIsLoading",
    ]),
    clearSignature() {
      this.errors.ricSignature = "";
      if (this.signaturePad) {
        this.signaturePad.clear();
      }
    },
    displayEfta() {
      this.showEfta = true;
      document.body.style.overflow = "hidden";
    },
    closeEfta() {
      this.showEfta = false;
      document.body.style.overflow = "auto";
    },
    async finalize() {
      try {
        this.isSubmitting = true;
        this.setIsLoading(true);
        await finalizeApplication();
        this.setIsLoading(false);

        await this.$router.push({
          name: "repayment",
        });
      } catch (error) {
        this.isSubmitting = false;
        this.setIsLoading(false);
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
    getCanvas(id: string) {
      const wrapper = document.getElementById(id);
      if (!wrapper) {
        this.errors.ricSignature = "Could not create signature pad";
        return;
      }
      return wrapper.querySelector("canvas");
    },
    handleResize() {
      if (!this.ricSignature) {
        const canvas = this.getCanvas("ric-signature-pad");
        if (!canvas || !this.signaturePad) {
          this.errors.ricSignature =
            "Could not handle resize for signature pad.";
          return;
        }

        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);

        this.clearSignature();
      }
    },
    initSignaturePad() {
      if (!this.ricSignature) {
        const canvas = this.getCanvas("ric-signature-pad");
        if (!canvas) {
          this.errors.ricSignature = "Could not create signature pad.";
          return;
        }
        this.signaturePad = new SignaturePad(canvas, {});
      }
    },
    print() {
      (this.$refs.CA as any).printSummary();
    },
    async saveSignature() {
      this.isSubmitting = true;

      const signature: string = this.signaturePad.toDataURL("image/png");
      if (this.signaturePad.isEmpty() || !signature) {
        this.errors.ricSignature =
          "You must sign the Retail Installment Contract to continue your application.";
        this.isSubmitting = false;

        return;
      }

      try {
        this.setIsLoading(true);
        const imgBase64 = signature.split("base64,")[1];
        await saveSignature(imgBase64);

        this.setSignature(signature);
        this.ricSignature = true;
        this.isSubmitting = false;
        this.setIsLoading(false);
      } catch (error) {
        this.isSubmitting = false;
        this.setIsLoading(false);
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
  },
  async created() {
    try {
      const { data } = await getApplicationData();
      const { isCompleted, lastStep, selectedOffer, ricSignature } = data;

      if (isCompleted) {
        await this.$router.push({ name: "userDashboard" });
      } else if (
        !(
          (lastStep === "offers" && selectedOffer) ||
          lastStep === "sign-contract"
        )
      ) {
        await this.$router.push({ name: lastStep });
      } else {
        this.setStep(4);
        const { data } = await getOfferData();
        const {
          date,
          paymentScheduleInfo,
          provider,
          screenTracking,
          userData,
          selectedOffer: selectedOfferForContract,
        } = data;
        this.user = userData;
        this.screenTracking = screenTracking;
        this.selectedOffer = selectedOffer;

        this.setProvider(provider);
        this.setPaymentScheduleInfo(paymentScheduleInfo);
        this.setSelectedOffer(selectedOfferForContract);
        this.setUserData(userData);
        this.setScreenTracking(screenTracking);
        this.setDate(date);
        if (ricSignature) {
          this.setSignature(ricSignature);
          this.ricSignature = true;
        }

        this.$nextTick(() => {
          // Add the component back in
          this.renderComponent = true;
          this.initSignaturePad();
          this.handleResize();
          window.onresize = () => {
            this.handleResize();
          };
        });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        await this.$router.push({ name: "userLogin" });
      } else {
        showErrorToast(this, "error", error.message);
      }
    }
  },
});
</script>

<style scoped>
.efta__container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  background-color: hsla(0, 0%, 24%, 0.8);
  z-index: 99;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow: auto;
}
.efta__close {
  position: fixed;
  top: 5px;
  right: 20px;
  width: 40px;
  height: 40px;
  font-size: 20px;
  font-weight: bold;
  color: #ffffff;
  background-color: #c7452e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  cursor: pointer;
}
.efta__container--hidden {
  display: none;
}
.efta__wrapper {
  background-color: white;
  padding: 50px;
  width: 210mm;
  height: 297mm;
}
.efta__document {
  background-color: white;
  color: black;
  width: 100%;
}
.efta__header {
  font-weight: bold;
  font-size: 11pt;
  margin-bottom: 1.5em;
  text-align: center;
}
.efta__body {
  font-family: "Calibri", sans-serif !important;
  font-size: 11pt;
  margin-bottom: 1.5em;
  text-align: justify;
}
.efta__body strong {
  font-weight: bold;
  text-decoration: underline;
}
.efta__list {
  font-family: "Calibri", sans-serif !important;
  font-size: 11pt;
  text-align: left;
}
</style>
