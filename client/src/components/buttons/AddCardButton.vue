<template>
  <div>
    <div class="text-right">
      <button class="primary" @click="showAddCardModal">Add Account</button>
    </div>
    <VueFinalModal v-model="modal" classes="share-modal-container" content-class="share-modal-content"
      :clickToClose="false">
      <ValidationObserver ref="observer" v-slot="{}">
        <b-tabs style="margin-top: 20px; max-height: 600px; overflow: auto">
          <b-tab title="Card" active>
            <b-form @submit.stop.prevent="() => onSubmit('card')" style="transform: scale(0.8,0.8);">
              <div class="cardForm">
                <h5 class="cardDetails">Debit Card Details</h5>
                <div class="visa">
                  <font-awesome-icon :icon="['fab', 'cc-visa']" />
                </div>
                <div class="masterCard">
                  <font-awesome-icon :icon="['fab', 'cc-mastercard']" />
                </div>
                <div class="masterCard">
                  <font-awesome-icon :icon="['fab', 'cc-amex']" />
                </div>
                <div class="masterCard">
                  <font-awesome-icon :icon="['fab', 'cc-discover']" />
                </div>

                <b-form-row>
                  <b-col md="12">
                    <ValidationProvider name="Card Number" :rules="{
                      required: true,
                      min: amexOrVisaLength,
                      max: amexOrVisaLength,
                    }" v-slot="validationContext">
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
                    <ValidationProvider name="Expiration" :rules="{
                      required: true,
                      min: 5,
                      max: 5,
                      notExpired: true,
                    }" v-slot="validationContext">
                      <b-form-group>
                        <b-form-input type="text" autocomplete="off" v-model="expirationDate" v-mask="'##/##'"
                          placeholder="Expiration (MM/YY)" :state="getValidationState(validationContext)">
                        </b-form-input>
                        <b-form-invalid-feedback>{{
                            validationContext.errors[0]
                        }}</b-form-invalid-feedback>
                      </b-form-group>
                    </ValidationProvider>
                  </b-col>

                  <b-col md="6">
                    <ValidationProvider name="Security code" :rules="{
                      required: true,
                      min: amexOrVisaSecLength,
                      max: amexOrVisaSecLength,
                    }" v-slot="validationContext">
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
                    v-on:change="showHomeAddress()" />
                  <label for="checkbox" class="homeAddressLabel">
                    Home address</label>
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
              </div>
              <!-- <div class="row" style="margin-top: -30px;">
            <b-col md="6">
                <input type="checkbox" id="isDefaultCard" v-model="checked" v-on:change="checkDefault()">
                <label for="checkbox">Use this card for auto payment</label>
            </b-col>
          </div> -->
              <div class="row">
                <button @click="onCancel" type="button" class="secondary" style="margin-right: 10px;">
                  Cancel
                </button>
                <button type="submit" class="primary" style="margin-left: 10px;">
                  <span>Add Card</span>
                  <b-spinner small v-show="isLoading"></b-spinner>
                </button>
              </div>
            </b-form>
          </b-tab>
          <b-tab title="ACH">
            <div class="cardForm">
              <b-form @submit.stop.prevent="() => onSubmit('ACH')" style="transform: scale(0.9,0.9)">
                <h5 class="cardDetails">ACH</h5>
                <!--  bankName: string;
                      accountHolder: string;
                      routingNumber: string;
                      accountNumber: string; -->

                <b-form-row>
                  <b-col md="12">
                    <ValidationProvider name="Bank name" :rules="{
                      required: true,
                    }" v-slot="validationContext">
                      <b-form-group>
                        <b-form-input v-model="bankName" placeholder="Bank name"
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
                    <ValidationProvider name="Account holder name" :rules="{
                      required: true,
                    }" v-slot="validationContext">
                      <b-form-group>
                        <b-form-input v-model="accountHolder" placeholder="Account holder name"
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
                    <ValidationProvider name="Routing number" :rules="{
                      required: true,
                    }" v-slot="validationContext">
                      <b-form-group>
                        <b-form-input v-model="routingNumber" placeholder="Routing number" v-mask="'#########'"
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
                    <ValidationProvider name="Account number" :rules="{
                      required: true,
                    }" v-slot="validationContext">
                      <b-form-group>
                        <b-form-input v-model="accountNumber" placeholder="Account number" v-mask="'#################'"
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
                    v-on:change="showHomeAddress()" />
                  <label for="checkbox" class="homeAddressLabel">
                    Home address</label>
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

                <div class="row">
                  <button @click="onCancel" type="button" class="secondary" style="margin-right: 10px;">
                    Cancel
                  </button>
                  <button type="submit" class="primary" style="margin-left: 10px;">
                    <span>Add ACH</span>
                    <b-spinner small v-show="isLoading"></b-spinner>
                  </button>
                </div>
              </b-form>
            </div>
          </b-tab>
        </b-tabs>
      </ValidationObserver>
    </VueFinalModal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import states from "@/helpers/states";
import { adminDashboardRequests } from "@/api/admin-dashboard";
import { errorHandler } from "@/api/error-handler";
import CardValidator from "card-validator";
import { saveEFTA } from "@/user-application/repayment/api";
import { getApplicationData } from "@/user-application/application/api";

const AMEX_MASK = "#### ###### #####";
const VISA_MASK = "#### #### #### ####";
export default Vue.extend({
  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
    type: {
      required: true,
      type: String,
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
      isSubmitting: false,
      lastName: null as null | string,
      modal: false,
      selectedState: null as null | string,
      state: null,
      states: states as { state: string; stateCode: null | string }[],
      street: null as null | string,
      zipCode: null as null | string,
      isDefaultCard: false,
      checked: false,
      bankName: null as null | string,
      accountHolder: null as null | string,
      routingNumber: null as null | string,
      accountNumber: null as null | string,
    };
  },
  computed: {
    isAmex(): boolean {
      if (this.cardNumber) {
        return (
          this.cardNumber.substr(0, 2) === "37" ||
          this.cardNumber.substr(0, 2) === "34"
        );
      }
      return false;
    },
    amexOrVisa(): string {
      return this.isAmex ? AMEX_MASK : VISA_MASK;
    },
    amexOrVisaSecurityCode(): string {
      return this.isAmex ? "####" : "###";
    },
    amexOrVisaLength(): number {
      return this.isAmex ? 17 : 19;
    },
    amexOrVisaSecLength(): number {
      return this.isAmex ? 4 : 3;
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
    showAddCardModal() {
      this.modal = true;
    },
    async getUserinfo() {
      try {
        const { data } = await adminDashboardRequests.getApplication(
          this.screenTrackingId
        );
        this.userData = data;
      } catch (error) {
        return error;
      }
    },
    async showHomeAddress() {
      const userData = await this.getUserinfo();

      if (this.checked == true) {
        this.firstName = this.userData
          ? this.userData.name.split(" ")[0]
          : null;
        this.lastName = this.userData ? this.userData.name.split(" ")[1] : null;
        this.selectedState = this.userData ? this.userData.state : null;
        this.zipCode = this.userData ? this.userData.zipCode : null;
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
      } else {
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
        applicationReference: this.userData
          ? this.userData.financingReferenceNumber
          : "",
        cardCode: this.cardCode || "",
        cardHolder: this.cardHolder || "",
        cardIssuer: this.cardIssuer() || "",
        cardNumber: cardNumber || "",
        city: this.city || "",
        expirationMonth: expMonth || "",
        expirationYear: expYear || "",
        firstName: this.userData ? this.userData.name.split(" ")[0] : "",
        lastName: this.userData ? this.userData.name.split(" ")[1] : "",
        phoneNumber: this.userData ? this.userData.phoneNumber : "",
        selectedOffer: this.userData ? this.userData.selectedOffer : {},
        selectedState: this.selectedState || "",
        signature: this.userData ? this.userData.ricSignature : "",
        street: this.street || "",
        zipCode: this.zipCode || "",
      };

      await adminDashboardRequests.adminSaveEFTA(requestBody);
    },
    cardIssuer() {
      if (this.cardNumber) {
        const result = CardValidator.number(this.cardNumber);
        return result.card?.niceType;
      }
      return null;
    },
    async onSubmit(type = "card") {
      this.isSubmitting = true;
      this.isDefaultCard = true;
      this.isLoading = true;
      this.isSubmitting = true;

      if (type === "card") {
        const [expMonth, expYear] = this.expirationDate?.split("/") ?? "";
        const cardNumber = this.cardNumber?.split(" ").join("");
        // await this.saveEFTAAgreement();
        try {
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
            isDefaultCard: this.isDefaultCard,
          };

          await adminDashboardRequests.addCard(
            this.screenTrackingId,
            requestBody
          );
          this.isLoading = false;

          await this.$swal({
            title: "Success!",
            text: "Card successfully added.",
            icon: "success",
          });

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

          this.isLoading = false;
          this.isSubmitting = false;
          this.modal = false;
        }
      }

      if (type === "ACH") {
        try {
          const requestBody = {
            bankName: this.bankName || "",
            accountHolder: this.accountHolder || "",
            routingNumber: this.routingNumber || "",
            accountNumber: this.accountNumber || "",
          };

          await adminDashboardRequests.addBank(
            this.screenTrackingId,
            requestBody
          );
          this.isLoading = false;

          await this.$swal({
            title: "Success!",
            text: "ACH successfully added.",
            icon: "success",
          });

          this.modal = false;
          this.$emit("reloadPage");
        } catch (error) {
          this.bankName = "";
          this.accountHolder = "";
          this.routingNumber = "";
          this.accountNumber = "";
          const errorMessage = await errorHandler(error, this.$router);
          if (errorMessage) {
            await this.$swal({
              title: "Error",
              text: `${errorMessage}`,
              icon: "error",
            });
          }

          this.isLoading = false;
          this.isSubmitting = false;
          this.modal = false;
        }
      }
    },
  },
});
</script>

<style scoped>
.primary {
  background-color: #ea4c89;
  color: white;
}
</style>
