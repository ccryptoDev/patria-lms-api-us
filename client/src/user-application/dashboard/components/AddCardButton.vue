<template>
  <div>
    <div class="text-right">
      <button class="primary" @click="showAddCardModal">Add Card</button>
    </div>
    <VueFinalModal v-model="modal" classes="share-modal-container" content-class="share-modal-content"
      :clickToClose="false">
      <div class="container" style="width: 800px;height: 650px;overflow:auto;">
        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <b-form @submit.stop.prevent="handleSubmit(onSubmit)" style="transform: scale(0.9,0.9)">
            <div class="cardForm">
              <h5 class="cardDetails">Debit Card Details</h5>
              <div class="visa"><i class="fab fa-cc-visa"></i></div>
              <div class="masterCard">
                <i class="fab fa-cc-mastercard"></i>
              </div>

              <b-form-row>
                <b-col md="12">
                  <ValidationProvider name="Card Number"
                    :rules="{ required: true, min: amexOrVisaLength, max: amexOrVisaLength }"
                    v-slot="validationContext">
                    <b-form-group>
                      <b-form-input v-model="cardNumber" v-mask="amexOrVisa" placeholder="Card Number"
                        :state="getValidationState(validationContext)"></b-form-input>

                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>
              </b-form-row>

              <b-form-row>
                <b-col md="12">
                  <ValidationProvider name="Name" :rules="{ required: true }" v-slot="validationContext">
                    <b-form-group>
                      <b-form-input v-model="cardHolder" placeholder="Full Name"
                        :state="getValidationState(validationContext)" @keypress="isLetter($event)"></b-form-input>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>
              </b-form-row>

              <b-form-row>
                <b-col md="6">
                  <ValidationProvider name="Expiration" :rules="{ required: true, min: 5, max: 5, notExpired: true }"
                    v-slot="validationContext">
                    <b-form-group>
                      <b-form-input type="text" autocomplete="off" v-model="expirationDate" v-mask="'##/##'"
                        placeholder="Expiration (MM/YY)" :state="getValidationState(validationContext)"></b-form-input>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>

                <b-col md="6">
                  <ValidationProvider name="Security code"
                    :rules="{ required: true, min: amexOrVisaSecLength, max: amexOrVisaSecLength }"
                    v-slot="validationContext">
                    <b-form-group>
                      <b-form-input type="password" autocomplete="off" v-model="cardCode"
                        v-mask="amexOrVisaSecurityCode" placeholder="Security Code"
                        :state="getValidationState(validationContext)"></b-form-input>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>
              </b-form-row>

              <h5 class="billingAddress">Billing Address</h5>
              <b-form-row>
                <input type="checkbox" class="isHomeAddress" id="isHomeAddress" v-model="checked"
                  v-on:change="showHomeAddress()">
                <label for="checkbox" class="homeAddressLabel"> Home address</label>
              </b-form-row>

              <b-form-row>
                <b-col md="6">
                  <ValidationProvider name="first Name" :rules="{ required: true }" v-slot="validationContext">
                    <b-form-group>
                      <b-form-input v-model="firstName" ref="firstName" placeholder="First Name"
                        :state="getValidationState(validationContext)" @keypress="isLetter($event)"></b-form-input>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>

                <b-col md="6">
                  <ValidationProvider name="Last Name" :rules="{ required: true }" v-slot="validationContext">
                    <b-form-group>
                      <b-form-input v-model="lastName" ref="lastName" placeholder="Last Name"
                        :state="getValidationState(validationContext)" @keypress="isLetter($event)"></b-form-input>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>
              </b-form-row>

              <b-form-row>
                <b-col md="12">
                  <ValidationProvider name="Street Address" :rules="{ required: true }" v-slot="validationContext">
                    <b-form-group>
                      <b-form-input v-model="street" ref="street" placeholder="Street Address"
                        :state="getValidationState(validationContext)"></b-form-input>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>
              </b-form-row>

              <b-form-row>
                <b-col md="12">
                  <ValidationProvider name="City" :rules="{ required: true }" v-slot="validationContext">
                    <b-form-group>
                      <b-form-input v-model="city" ref="city" placeholder="City"
                        :state="getValidationState(validationContext)" @keypress="isLetter($event)"></b-form-input>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>
              </b-form-row>

              <b-form-row>
                <b-col md="6">
                  <ValidationProvider name="State" :rules="{ required: true }" v-slot="validationContext">
                    <b-form-group>
                      <b-form-select v-model="selectedState" ref="selectedState"
                        :state="getValidationState(validationContext)" :options="parsedStates" class="form-control">
                      </b-form-select>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>

                <b-col md="6">
                  <ValidationProvider name="Zip Code" :rules="{ required: true }" v-slot="validationContext">
                    <b-form-group>
                      <b-form-input v-model="zipCode" ref="zipCode" v-mask="'#####'" placeholder="Zip Code"
                        :state="getValidationState(validationContext)"></b-form-input>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>
              </b-form-row>
              <div v-if="!autopayStatusData" class="custom-control custom-checkbox check-agreement">
                <input type="checkbox" class="custom-control-input" id="enableAutopay" name="enableAutopay"
                  v-model="isAutopayChecked" />
                <label id="enableAutopayLabel" class="custom-control-label" for="enableAutopay">Turn on auto
                  payment</label>
              </div>
              <div class="custom-control custom-checkbox check-agreement">
                <input type="checkbox" class="custom-control-input" id="eftaAgreement" name="eftaAgreement"
                  v-model="isEFTAChecked" />
                <label v-if="isAutopayChecked" class="custom-control-label" for="eftaAgreement">By selecting this box, I
                  have reviewed this authorization
                  for having my contract payments made with this payment method automatically and
                  agree to its terms.</label>
                <label v-else class="custom-control-label" for="eftaAgreement">By selecting this box, I have reviewed
                  this authorization
                  for having my contract payments made using this payment method and
                  agree to its terms.</label>
              </div>
            </div>

            <div class="row">
              <button @click="onCancel" type="button" class="secondary" style="margin-right: 10px;">
                Cancel
              </button>
              <button type="submit" class="primary" style="margin-left: 10px;" :disabled="!isEFTAChecked">
                <span>Add Card</span>
                <b-spinner small v-show="isLoading"></b-spinner>
              </button>
            </div>
          </b-form>
        </ValidationObserver>
      </div>
    </VueFinalModal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import states from "@/helpers/states";
import { errorHandler } from "@/api/error-handler";
import CardValidator from "card-validator";
import { getApplicationData } from "@/user-application/application/api";
import IOffer from "@/user-application/offers/types/IOffer";
import { getIp } from "@/user-application/helpers";
import showErrorToast from "@/helpers/errorToast";
import { mapMutations } from "vuex";
import {
  addCard,
  saveEFTA,
} from "@/user-application/repayment/api";
import { enableAutopay } from "@/user-application/dashboard/api";

const AMEX_MASK = '#### ###### #####'
const VISA_MASK = '#### #### #### ####'
export default Vue.extend({
  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
    paymentManagementId: {
      required: true,
      type: String,
    },
    autopayStatus: {
      required: true,
      type: Boolean,
    },
    addCardFlag: {
      required: true,
      type: Boolean,
    },
  },
  data() {
    return {
      cardCode: null as null | string,
      userData: null as null | Record<string, any>,
      cardHolder: null as null | string,
      cardNumber: null as null | string,
      city: null as null | string,
      expirationDate: null as null | string,
      firstName: null as null | string,
      isLoading: false,
      lastName: null as null | string,
      modal: this.addCardFlag,
      selectedState: null as null | string,
      states: states as { state: string; stateCode: null | string }[],
      street: null as null | string,
      zipCode: null as null | string,
      isDefaultCard: false,
      isEFTAChecked: false,
      isAutopayChecked: this.addCardFlag,
      autopayStatusData: this.autopayStatus,
      checked: false,
      isSubmitting: false,
      applicationReference: null as null | string,
      phones: null as null | { phone: string; type: string }[],
      selectedOffer: null as null | IOffer,
      ricSignature: null as null | string,
      ip: null as null | string,
    };
  },
  computed: {
    isAmex(): boolean {
      if (this.cardNumber) {
        return (this.cardNumber.substr(0, 2) === '37' || this.cardNumber.substr(0, 2) === '34')
      }
      return false
    },
    amexOrVisa(): string {
      return this.isAmex ? AMEX_MASK : VISA_MASK
    },
    amexOrVisaSecurityCode(): string {
      return this.isAmex ? "####" : "###"
    },
    amexOrVisaLength(): number {
      return this.isAmex ? 17 : 19
    },
    amexOrVisaSecLength(): number {
      return this.isAmex ? 4 : 3
    },
    parsedStates(): { value: string | null; text: string }[] {
      return this.states.map((state) => {
        return {
          value: state.stateCode,
          text: state.state,
        };
      });
    },
  },
  methods: {
    ...mapMutations(["setIsLoading"]),
    showAddCardModal() {
      this.modal = true;
    },
    async getUserinfo() {
      try {
        const [
          applicationDataResponse,
        ] = await Promise.all([getApplicationData()]);
        this.userData = applicationDataResponse.data;
      } catch (error) {
        return error;
      }
    },
    async showHomeAddress() {
      const userData = await this.getUserinfo();

      if (this.checked == true) {
        this.firstName = this.userData ? this.userData.firstName : null;
        this.lastName = this.userData ? this.userData.lastName : null;
        this.selectedState = this.userData ? this.userData.state : null;
        this.zipCode = this.userData ? this.userData.zip : null;
        this.city = this.userData ? this.userData.city : null;
        this.street = this.userData ? this.userData.street : null;
        const fName = this.$refs.firstName as any;
        const lName = this.$refs.lastName as any;
        const sName = this.$refs.street as any;
        const cName = this.$refs.city as any;
        const zName = this.$refs.zipCode as any;
        fName.focus();
        lName.focus();
        sName.focus();
        cName.focus();
        zName.focus();
        fName.focus();
      }
      else {
        this.firstName = null;
        this.lastName = null;
        this.selectedState = null;
        this.zipCode = null;
        this.city = null;
        this.street = null;
      }
    },
    onCancel() {
      this.street = null;
      this.city = null;
      this.firstName = null;
      this.lastName = null;
      this.selectedState = null;
      this.zipCode = null;
      this.cardCode = null;
      this.cardNumber = null;
      this.expirationDate = null;
      this.selectedState = null;
      this.modal = false;
      this.isDefaultCard = false;
      this.isSubmitting = false;

      this.$nextTick(() => {
        (this.$refs.observer as any).reset();
      });
    },
    isLetter(event: KeyboardEvent) {
      const char = event.key;
      if (!/^[a-zA-Z\s]+$/.test(char)) {
        event.preventDefault();
      }
    },
    getValidationState({
      validated,
      valid = null,
    }: {
      validated: boolean;
      valid: null | boolean;
    }) {
      return validated ? valid : null;
    },
    async saveEFTAAgreement() {
      const [expMonth, expYear] = this.expirationDate?.split("/") ?? "";
      const cardNumber = this.cardNumber?.split(" ").join("");
      const userData = await this.getUserinfo();
      const requestBody = {
        userId: this.userData ? this.userData.userId : "",
        applicationReference: this.userData ? this.userData.applicationReference : "",
        cardCode: this.cardCode || "",
        cardHolder: this.cardHolder || "",
        cardIssuer: this.cardIssuer() || "",
        cardNumber: cardNumber || "",
        city: this.city || "",
        expirationMonth: expMonth || "",
        expirationYear: expYear || "",
        firstName: this.userData ? this.userData.firstName : "",
        lastName: this.userData ? this.userData.lastName : "",
        phoneNumber: this.userData ? this.userData.phones[0].phone : "",
        selectedOffer: this.userData ? this.userData.selectedOffer : {},
        selectedState: this.selectedState || "",
        signature: this.userData ? this.userData.ricSignature : "",
        street: this.street || "",
        zipCode: this.zipCode || "",
      };

      // await saveEFTA(requestBody);
    },
    async saveCard() {
      this.isSubmitting = true;
      const [expMonth, expYear] = this.expirationDate?.split("/") ?? "";
      const cardNumber = this.cardNumber?.split(" ").join("");
      const requestBody = {
        billingAddress1: this.street || "",
        billingCity: this.city || "",
        billingFirstName: this.firstName || "",
        billingLastName: this.lastName || "",
        billingState: this.selectedState || "",
        billingZip: this.zipCode || "",
        cardCode: this.cardCode || "",
        cardNumber: cardNumber || "",
        expMonth,
        expYear,
        paymentType: 'CARD',
        screenTrackingId: this.screenTrackingId,
        nameOnCard: this.cardHolder,
      };
      const { data } = await addCard(requestBody);
    },
    cardIssuer() {
      if (this.cardNumber) {
        const result = CardValidator.number(this.cardNumber);
        return result.card?.niceType;
      }
      return null;
    },
    async onSubmit() {
      this.isSubmitting = true;
      this.isDefaultCard = true;
      this.isLoading = true;
      try {
        if (this.cardIssuer()) {
          const promiseArray = [this.saveEFTAAgreement(), this.saveCard()];
          await Promise.all(promiseArray);
          if (this.isAutopayChecked) {
            const requestBody = { paymentManagementId: this.paymentManagementId }
            await enableAutopay(requestBody);
            this.autopayStatusData = true;
          }
          await this.$swal({
            title: "Success!",
            text: "Card successfully added.",
            icon: "success",
          });
          this.isLoading = false;
          this.modal = false;
          this.$emit("reloadPage");
        } else {
          this.cardNumber = "";
          this.cardCode = "";
          this.expirationDate = "";
          this.cardHolder = "";
          await this.$swal({
            title: "Error",
            text: `${"The card info you entered is invalid!"}`,
            icon: "error",
          });
          this.isLoading = false;
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
        this.isLoading = false;
        this.modal = false;
      }
    },
  },
});
</script>

<style scoped>
button:focus {
  outline: none;
}

button:disabled {
  background-color: #DCDCDC;
}

.primary {
  background-color: #ea4c89;
  color: white;
}

::v-deep .modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep .modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  max-height: 95%;
  margin: 0 22rem;
  padding: 2rem 3rem 2rem 3rem;
  border: 1px solid #e2e8f0;
  border-radius: 1.25rem;
  background: #fff;
}

.modal__title {
  margin: 0 2rem 0 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal__content {
  flex-grow: 1;
  overflow-y: auto;
  margin-top: 3px;
}

.modal__close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
}

.checkbox-container {
  display: inline-block;
  margin-left: 15px;
  position: relative;
  padding-left: 25px;
  font-size: 1rem;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.checkbox-container:first-child {
  margin-left: 0;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
}

.check-mark {
  position: absolute;
  top: 0;
  left: 0;
  height: 15px;
  width: 15px;
  background-color: #fff;
  border: 1px solid #000;
}

.check-mark::after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked~.check-mark::after {
  display: block;
}

.checkbox-container .check-mark::after {
  left: 4px;
  top: 2px;
  width: 5px;
  height: 8px;
  border: solid #000;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

#enableAutopayLabel {
  color: #ea4c89;
  font-weight: bold;
}
</style>
