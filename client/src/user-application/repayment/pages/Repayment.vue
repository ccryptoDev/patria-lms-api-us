<template>
  <Layout v-if="selectedOffer" :steps="true" :login="true">
    <div>
      <div id="repayment">
        <div v-if="!review" class="repaymentContainer">
          <div class="container-fluid">
            <div class="row justify-content-center">
              <div class="col-md-8 col-sm-12">
                <div class="row justify-content-center" style="margin-bottom: 36px;">
                  <div class="col-md-12 col-sm-12 text-center">
                    <div class="page-main-title paymentMethodPosition">
                      Payment Method
                    </div>
                  </div>
                </div>

                <div class="schedulePayment">
                  <div class="row justify-content-center repaymentHeaderCenter">
                    <div class="col-md-12">
                      <p class="totalDue">
                        <span class="dollar">{{
                            selectedOffer.downPayment | currencyWithoutSign
                        }}</span>
                      </p>
                      <p class="totalDueToday">Total Due Today</p>
                      <br />
                    </div>
                  </div>

                  <div class="row justify-content-center repaymentHeaderCenter">
                    <div class="col-md-12">
                      <p id="schedulePay">
                        <span class="dollar">{{
                            (selectedOffer.promoSelected
                              ? selectedOffer.promoMonthlyPayment
                              : selectedOffer.monthlyPayment)
                            | currencyWithoutSign
                        }}</span>
                      </p>
                      <p id="scheduledOfferPayment">Scheduled Payment</p>

                      <div class="far couponcode" style="margin-left: 10px;">
                        <i class="far fa-question-circle" style="vertical-align: center;"></i>
                        <span class="coupontooltip" style="height: 60px;">This is the minimum monthly amount due
                          starting next month.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="application-form">
            <div class="container">
              <div class="row justify-content-center">
                <div class="col-md-8 col-sm-12">
                  <ValidationObserver v-if="!apply" ref="observer" v-slot="{ handleSubmit }">
                    <div v-if="selectedOffer.downPayment === 0" class="form-section-label">
                      AutoPay Method
                    </div>
                    <div v-else class="form-section-label">
                      DownPayment Method
                    </div>

                    <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
                      <div class="cardForm">
                        <h5 class="cardDetails">Card Details</h5>
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
                                  :state="getValidationState(validationContext)" @keypress="isLetter($event)">
                                </b-form-input>
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
                            <ValidationProvider name="first Name" :rules="{ required: true }"
                              v-slot="validationContext">
                              <b-form-group>
                                <b-form-input v-model="firstName" ref="firstName" placeholder="First Name"
                                  :state="getValidationState(validationContext)"></b-form-input>
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
                            <ValidationProvider name="Street Address" :rules="{ required: true }"
                              v-slot="validationContext">
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
                                  :state="getValidationState(validationContext)"></b-form-input>
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
                                  :state="getValidationState(validationContext)" :options="parsedStates"
                                  class="form-control">
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

                        <b-row v-if="!apply">
                          <b-col lg="12" md="12" sm="12" xs="12">
                            <div class="d-flex justify-content-between">
                              <button type="button" @click="onSetupAutoPayLater"
                                class="btn btn-primary btn-lg submit-form-lg"
                                style="background-color: #fff; color: #ea4c89;" :disabled="isSubmitting">
                                Setup Later
                              </button>
                              <button type="submit" class="btn btn-primary btn-lg submit-form-lg "
                                :disabled="isSubmitting">
                                Submit
                              </button>
                            </div>
                          </b-col>
                        </b-row>
                      </div>
                    </b-form>
                  </ValidationObserver>
                </div>
              </div>
            </div>
          </div>

          <div v-if="apply === true" class="reviewContainer">
            <div class="container">
              <div class="row justify-content-center">
                <div class="col-md-8 col-sm-12">
                  <div class="form-row reviewTitle">
                    <div class="form-group col-md-4">
                      <h4 v-if="selectedOffer.downPayment === 0">
                        AutoPay Review
                      </h4>
                      <h4 v-else>Down Payment Review</h4>
                    </div>
                    <div class="form-group col-md-2">
                      <p @click.prevent="editCard" class="editCard">
                        Edit Card
                      </p>
                    </div>
                  </div>
                  <div class="form-row reviewForm">
                    <div class="form-group col-md-12">
                      <div class="form-row justify-content-start firstReview">
                        <div class="col-md-3 col-sm-3 col-4">
                          <p>AMOUNT</p>
                        </div>
                        <div class="col-md-3 col-sm-3 col-4">
                          <p>DATE</p>
                        </div>
                        <div class="col-md-3 col-sm-3 col-4">
                          <p>PAYMENT METHOD</p>
                        </div>
                        <div class="col-md-3 col-sm-3 col-4" v-if="selectedOffer.downPayment > 0">
                          <p>DOWN PAYMENT</p>
                        </div>
                      </div>
                      <div class="form-row justify-content-start lastReview">
                        <div class="col-md-3 col-sm-3 col-4">
                          <p class="reviewAmount">
                            <span class="dollar">
                              {{
                                  selectedOffer.promoSelected
                                    ? selectedOffer.promoMonthlyPayment
                                    : selectedOffer.monthlyPayment
                              }}</span>
                          </p>
                        </div>
                        <div class="col-md-3 col-sm-3 col-4">
                          <p>{{ dateNextMonth }}</p>
                        </div>
                        <div class="col-md-3 col-sm-3 col-3">
                          <p>
                            {{ cardIssuer }}
                            {{ cardNumber.substr(cardNumber.length - 4) }}
                          </p>
                        </div>
                        <div class="col-md-3 col-sm-3 col-4" v-if="selectedOffer.downPayment > 0">
                          <p>
                            <span class="dollar">{{
                                selectedOffer.downPayment | currencyWithoutSign
                            }}
                              (today)</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <a id="efta-toggle" @click.prevent="showModalElectr = true" href="#efta-toggle">
                    <strong>Electronic Funds Transfer Authorization</strong>
                  </a>
                  <div class="custom-control custom-checkbox check-agreement">
                    <input type="checkbox" class="custom-control-input" id="eftaAgreement" name="eftaAgreement"
                      v-model="isEFTAChecked" />
                    <label class="custom-control-label" for="eftaAgreement">By selecting this box, I have reviewed this
                      authorization
                      for having my contract payments made automatically and
                      agree to its terms.</label>
                  </div>
                  <button class="btn btn-primary btn-lg submit-form-lg submitRepayment submitReview"
                    style="margin-bottom: 50px" :disabled="!isEFTAChecked || isSubmitting"
                    @click.prevent="submitReview">
                    I Agree, Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="review" class="confirmedReview">
          <div class="container-fluid">
            <div class="row justify-content-center">
              <div class="col-md-8 col-sm-12">
                <div class="row justify-content-center">
                  <div class="col-md-12">
                    <div class="paymentConfirmed">
                      <div class="row">
                        <div class="col-md-12">
                          <font-awesome-icon icon="check-circle" />
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12">
                          <h3>Payment Confirmed</h3>
                        </div>
                      </div>
                      <div class="row">
                        <div v-if="selectedOffer.downPayment > 0" class="col-md-12">
                          <p style="margin-bottom: 0">
                            <strong><span class="dollar">{{
                                selectedOffer.downPayment | currencyWithoutSign
                            }}</span>
                              paid</strong>
                            from VISA
                            {{ cardNumber.substr(cardNumber.length - 4) }}
                            on {{ new Date().toLocaleString().split(",")[0] }}
                          </p>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-12 text-center">
                          <button @click.prevent="finishReview"
                            class="btn btn-primary btn-lg submit-form-lg paymentConfirmedButton">
                            Continue
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VueFinalModal v-model="showModalElectr" classes="modal-container" content-class="modal-content">
        <span class="modal__title">
          <h4 style="margin: 0px; text-align: center">
            ACH, Credit and Debit Card Payment Authorization Form
          </h4>
        </span>
        <br />

        <div class="modal__content" style="padding: 0 10px 0 10px">
          <div class="esigndiv">
            <p>
              In this Authorization, “I,” “me” and “my” mean the person who
              signs this Authorization below. “You,” and “your” means
              <strong>PATRIA LENDING</strong>, or any assignee.
            </p>

            <p>
              By signing below, I authorize you to initiate a one-time charge
              and/or regularly scheduled recurring charges against my credit
              card or debit card account identified below, or a one-time charge
              and/or regularly scheduled recurring charges by ACH debit entry
              from my deposit account identified below, and to credit those
              amounts (when received by you) to the amounts due from me to you
              under
              <strong style="white-space: nowrap;">RETAIL INSTALLMENT CONTRACT</strong>, Account Number: <strong>{{
                  applicationReference
              }}</strong>. If necessary, I also authorize you to initiate transactions to
              correct any erroneous payment transaction. I also authorize you to
              initiate a one-time transaction to collect a fee of
              <strong>$25</strong>
              if any payment is rejected by my bank due to insufficient funds in
              my account or available credit on my credit card account, and/or
              to collect any late fee due under my contract identified above. I
              understand that each transaction will appear on my bank statement.
            </p>

            <p>
              <strong>Type of Payment (check applicable box and complete
                information):
              </strong>
            </p>

            <div>
              <label class="checkbox-container">Credit or Debit Card Payment
                <input type="checkbox" checked disabled />
                <span class="check-mark"></span>
              </label>
            </div>
            <br />

            <div style="border: 1px solid #000; padding: 10px;">
              <strong>
                <p>Credit/Debit Card Information</p>
              </strong>

              <div style="display: grid; grid-template-columns: 200px auto;">
                <span>Account Type:</span>
                <div>
                  <label class="checkbox-container">Visa
                    <input type="checkbox" :checked="cardIssuer === 'Visa'" disabled />
                    <span class="check-mark"></span>
                  </label>

                  <label class="checkbox-container">MasterCard
                    <input type="checkbox" :checked="cardIssuer === 'Mastercard'" disabled />
                    <span class="check-mark"></span>
                  </label>

                  <label class="checkbox-container">Amex
                    <input type="checkbox" :checked="cardIssuer === 'American Express'" disabled />
                    <span class="check-mark"></span>
                  </label>

                  <label class="checkbox-container">Discover
                    <input type="checkbox" :checked="cardIssuer === 'Discover'" disabled />
                    <span class="check-mark"></span>
                  </label>

                  <label class="checkbox-container">Other
                    <input type="checkbox" :checked="
                      !(
                        cardIssuer === 'Visa' ||
                        cardIssuer === 'Mastercard' ||
                        cardIssuer === 'American Express' ||
                        cardIssuer === 'Discover'
                      )
                    " disabled />
                    <span class="check-mark"></span>
                  </label>
                </div>

                <span> Card Issuer Name:</span>
                <span>{{ cardIssuer }}</span>

                <span>Cardholder Name:</span>
                <span>{{ cardHolder }}</span>

                <span> Card Account Number: </span>
                <span>{{ cardNumber }}</span>

                <span> Card Expiration Date: </span>
                <span>{{ expirationDate }}</span>

                <span>CVV:</span>
                <span>{{ cardCode }}</span>
              </div>

              <div>
                Cardholder Billing Address:
                <div>
                  <div style="padding-left: 40px; display: grid; grid-template-columns: 120px auto;">
                    <span>Address:</span>
                    <span>{{ street }}</span>

                    <span>City:</span>
                    <span>{{ city }}</span>

                    <span>State:</span>
                    <span>{{ selectedState }}</span>

                    <span>Zip Code:</span>
                    <span>{{ zipCode }}</span>

                    <span>Phone No.:</span>
                    <span> {{ phones[0].phone }} </span>
                  </div>
                </div>
              </div>
            </div>
            <br />

            <strong>
              <p>Payment Frequency:</p>
            </strong>

            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <div>
                <label class="checkbox-container">One-Time Payment
                  <input type="checkbox" :checked="selectedOffer.downPayment > 0" disabled />
                  <span class="check-mark"></span>
                </label>
              </div>

              <div>
                <label v-if="selectedOffer.downPayment > 0" style="margin-left: 80px;">
                  Payment date:
                  <strong>{{ todayDate }}</strong></label>
                <label v-else> Payment date: ____________________ </label>
              </div>

              <div>
                <label v-if="selectedOffer.downPayment > 0" style="margin-left: 80px;">
                  Payment amount:
                  <strong>
                    {{ selectedOffer.downPayment | currency }}</strong></label>
                <label v-else> Payment amount: ____________________ </label>
              </div>
            </div>

            <div>
              <label class="checkbox-container">Recurring Payments.
                <input type="checkbox" checked disabled />
                <span class="check-mark"></span>
              </label>
              My payments, in the amount of
              <strong v-if="selectedOffer.promoSelected">{{
                  selectedOffer.promoMonthlyPayment | currency
              }}</strong>
              <strong v-else>{{
                  selectedOffer.monthlyPayment | currency
              }}</strong>, will start on <strong>{{ loanStartDate }}</strong>, and will occur monthly thereafter for a
              total of
              <strong v-if="selectedOffer.promoSelected">{{
                  selectedOffer.promoTerm
              }}</strong><strong v-else>{{ selectedOffer.term }}</strong>
              months. If any payment date falls on a weekend or holiday, I
              understand and agree that the payment may be executed on the next
              business day. If my payment amount changes, I will receive notice
              from you at least 10 days prior to the payment being collected. If
              the outstanding balance I owe on my contract identified above is
              less than the payment amount stated above, I understand and agree
              that the final payment will be an amount equal to my total
              outstanding balance.
            </div>

            <div>
              <ol>
                <li>
                  I authorize you to initiate the credit card, debit card or ACH
                  payment(s) described in this authorization form according to
                  the terms outlined above. If I have authorized recurring
                  payments, I understand that this authorization will remain in
                  effect until my contract identified above is paid in full or I
                  cancel this authorization in writing (at
                  <strong>400 Spectrum Center Drive, Suite 350, Irvine CA
                    92618</strong>). I agree to notify you in writing of any changes in my
                  account information or termination of this authorization at
                  least three (3) business days prior to the next billing date.
                  I may also notify the financial institution that holds my
                  deposit account to stop payments under this authorization at
                  least three (3) business days before a scheduled payment date.
                  This payment authorization is for the type of payment
                  indicated above. I certify that I am an authorized user of any
                  credit or debit card identified above, or an authorized signer
                  on any deposit account identified above, and that I will not
                  dispute any scheduled payment provided the transaction
                  corresponds to the terms of this authorization form. I request
                  the financial institution that holds the account to honor all
                  payments initiated in accordance with this authorization form.
                  I acknowledge receipt of a completed copy of this
                  authorization form for my records.
                </li>
              </ol>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span>
                SIGNATURE:
                <img v-if="isEFTAChecked" style="max-width: 100%; height: auto;" width="300" height="200"
                  v-bind:src="ricSignature" />
                <span v-else> ________________________________________</span>
              </span>
              <span style="margin-left: 80px;"> DATE: {{ todayDate }}</span>
            </div>
            <div>
              PRINT NAME:
              <span>{{ userFirstName | capitalize }}
                {{ userLastName | capitalize }}</span>
            </div>
          </div>
          <p style="margin: 10px" class="ipDatePdf">Ip: {{ ip }}</p>
          <div class="text-center" style="margin-bottom: 20px">
            <button type="button" data-dismiss="modal" @click="showModalElectr = false"
              class="btn-application btn btn-primary btn-lg submit-form-lg finalizeButton">
              Continue
            </button>
          </div>
        </div>
      </VueFinalModal>
    </div>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";
import { mapMutations } from "vuex";
import moment from "moment";

import states from "@/helpers/states";
import Layout from "@/user-application/layout/pages/Layout.vue";
import showErrorToast from "@/helpers/errorToast";
import { getIp } from "@/user-application/helpers";
import { adminDashboardRequests } from "@/api/admin-dashboard";
import { getApplicationData } from "@/user-application/application/api";
import {
  addCard,
  makeDownPayment,
  saveEFTA,
  setupAutoPayLater,
  validateCard,
} from "@/user-application/repayment/api";
import IOffer from "@/user-application/offers/types/IOffer";
import { extend } from "vee-validate";
import CardValidator from "card-validator";

const AMEX_MASK = '#### ###### #####'
const VISA_MASK = '#### #### #### ####'
extend("notExpired", (value: string) => {
  const today = moment();
  const thisMonth = today.month() + 1;
  const thisYear = today.year();
  const splitted = value.split("/");
  const month = +splitted[0];
  const year = +splitted[1] + 2000; //20xx

  if (
    month > 12 ||
    year < thisYear ||
    (year === thisYear && month < thisMonth)
  ) {
    return "Expired card";
  }

  return true;
});

export default Vue.extend({
  components: {
    Layout,
  },
  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },
  data() {
    return {
      agreement: false,
      applicationReference: null as null | string,
      apply: false,
      autoPayMethod: false,
      userData: null as null | Record<string, any>,
      checked: false,
      cardCode: null as null | string,
      cardHolder: null as null | string,
      cardNumber: null as null | string,
      city: null as null | string,
      expirationDate: null as null | string,
      firstName: null as null | string,
      ip: null as null | string,
      isEFTAChecked: false,
      isSubmitting: false,
      lastName: null as null | string,
      loanStartDate: moment()
        .add(1, "month")
        .startOf("day")
        .format("MM/DD/YYYY"),
      paymentMethodToken: null as null | string,
      phones: null as null | { phone: string; type: string }[],
      review: false,
      ricSignature: null as null | string,
      selectedOffer: null as null | IOffer,
      selectedState: null as null | string,
      showModalElectr: false,
      state: null as null | string,
      states: states as { state: string; stateCode: null | string }[],
      street: null as null | string,
      userFirstName: null as null | string,
      userLastName: null as null | string,
      userCity: null as null | string,
      userStreet: null as null | string,
      userState: null as null | string,
      userzipCode: null as null | string,
      zipCode: null as null | string,
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
    todayDate() {
      return moment().format("MM/DD/YYYY");
    },
    dateNextMonth() {
      return moment()
        .add(1, "months")
        .format("L");
    },
    cardIssuer() {
      if (this.cardNumber) {
        const result = CardValidator.number(this.cardNumber);
        return result.card?.niceType;
      }
      return null;
    },
  },


  methods: {
    ...mapMutations(["setStep", "setIsLoading"]),
    isLetter(event: KeyboardEvent) {
      const char = event.key;
      if (!/^[a-zA-Z\s]+$/.test(char)) {
        event.preventDefault();
      }
    },

    async showHomeAddress() {
      const [expMonth, expYear] = this.expirationDate?.split("/") ?? "";
      const cardNumber = this.cardNumber?.split(" ").join("");


      if (this.checked == true) {
        this.firstName = this.userFirstName ? "   " + this.userFirstName : null;
        this.lastName = this.userLastName ? " " + this.userLastName : null;
        this.selectedState = this.userState ? this.userState : null;
        this.zipCode = this.userzipCode ? " " + this.userzipCode : null;
        this.city = this.userCity ? " " + this.userCity : null;
        this.street = this.userStreet ? " " + this.userStreet : null;
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
    getValidationState({
      validated,
      valid = null,
    }: {
      validated: boolean;
      valid: null | boolean;
    }) {
      return validated ? valid : null;
    },
    async onSetupAutoPayLater() {
      this.isSubmitting = true;
      this.setIsLoading(true);

      try {
        await setupAutoPayLater();
        this.isSubmitting = false;
        this.setIsLoading(false);
        await this.$router.push("/document-upload");
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
    editCard() {
      this.apply = false;
      this.isSubmitting = false;
    },
    async saveEFTAAgreement() {
      const [expMonth, expYear] = this.expirationDate?.split("/") ?? "";
      const cardNumber = this.cardNumber?.split(" ").join("");
      const requestBody = {
        userId: "",
        applicationReference: this.applicationReference || "",
        cardCode: this.cardCode || "",
        cardHolder: this.cardHolder || "",
        cardIssuer: this.cardIssuer || "",
        cardNumber: cardNumber || "",
        city: this.city || "",
        expirationMonth: expMonth || "",
        expirationYear: expYear || "",
        firstName: this.userFirstName || "",
        lastName: this.userLastName || "",
        phoneNumber: (this.phones && this.phones[0].phone) || "",
        selectedOffer: this.selectedOffer || {},
        selectedState: this.selectedState || "",
        signature: this.ricSignature || "",
        street: this.street || "",
        zipCode: this.zipCode || "",
      };

      // await saveEFTA(requestBody);
    },
    async saveCard() {
      this.isSubmitting = true;
      const [expMonth, expYear] = this.expirationDate?.split("/") ?? "";
      const cardNumber = this.cardNumber?.split(" ").join("");
      this.setIsLoading(true);

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
      };

      const { data: validationResponse } = await validateCard(requestBody);
      if (!validationResponse.CardValid) {
        this.isSubmitting = false;
        this.setIsLoading(false);

        showErrorToast(this, "error", "Invalid card");
        this.apply = false;
      } else {
        const { data } = await addCard(requestBody);
        this.paymentMethodToken = data.paymentMethodToken;
      }
    },
    async submitReview() {
      this.isSubmitting = true;
      this.setIsLoading(true);

      try {
        await Promise.all([this.saveEFTAAgreement(), this.saveCard()]);

        if (this.selectedOffer && this.selectedOffer.downPayment > 0) {
          const downPaymentRequestBody = {
            amount: this.selectedOffer.downPayment,
            paymentMethodToken: this.paymentMethodToken || "",
          };
          await makeDownPayment(downPaymentRequestBody);

          this.review = true;
          this.isSubmitting = false;
          this.setIsLoading(false);
        } else {
          this.isSubmitting = false;
          this.setIsLoading(false);
          await this.$router.push({ name: "document-upload" });
        }
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
    async finishReview() {
      await this.$router.push({ name: "document-upload" });
    },
    async onSubmit() {
      this.apply = true;
    },
  },

  async created() {
    try {
      this.setStep(5);
      const { data } = await getApplicationData();
      const {
        applicationReference,
        firstName,
        isCompleted,
        lastName,
        lastStep,
        phones,
        address,
        city,
        state,
        zip,
        ricSignature,
        selectedOffer,
      } = data;
      if (isCompleted) {
        await this.$router.push({ name: "userDashboard" });
      } else if (lastStep !== "repayment") {
        await this.$router.push({ name: lastStep });
      } else {
        this.applicationReference = applicationReference;
        this.phones = phones;
        this.ricSignature = ricSignature;
        this.selectedOffer = selectedOffer;
        this.userFirstName = firstName;
        this.userLastName = lastName;
        this.userStreet = address;
        this.userState = state;
        this.userCity = city;
        this.userzipCode = zip;
        const { data } = await getIp();
        this.ip = data.ip;
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
</style>
