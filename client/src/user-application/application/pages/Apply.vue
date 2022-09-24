<template>
  <Layout :steps="true" :login="true">
    <div class="home">
      <div id="apply">
        <div class="application-form">
          <div class="container">
            <div class="row justify-content-center">
              <div class="col-md-8 col-sm-12">
                <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
                  <b-form
                    autocomplete="off"
                    @submit.stop.prevent="handleSubmit(onSubmit)"
                  >
                    <div
                      class="row justify-content-center"
                      style="margin-bottom: 36px"
                    >
                      <div class="col-md-12 col-sm-12 text-center">
                        <div class="page-main-title">Personal Information</div>
                      </div>
                    </div>

                    <b-form-row>
                      <b-col md="5">
                        <ValidationProvider
                          name="First Name"
                          :rules="{ required: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label="First Name*"
                            label-for="firstName"
                            label-align="center"
                          >
                            <b-form-input
                              id="firstName"
                              v-model="firstName"
                              :state="getValidationState(validationContext)"
                              @keypress="isLetter($event)"
                            ></b-form-input>

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>

                      <b-col md="2">
                        <b-form-group
                          label="Middle Initial"
                          label-for="middleInitial"
                          label-align="center"
                        >
                          <b-form-input
                            id="middleInitial"
                            v-model="middleInitial"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>

                      <b-col md="5">
                        <ValidationProvider
                          name="Last Name"
                          :rules="{ required: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label="Last Name*"
                            label-for="lastName"
                            label-align="center"
                          >
                            <b-form-input
                              id="lastName"
                              v-model="lastName"
                              :state="getValidationState(validationContext)"
                              @keypress="isLetter($event)"
                            ></b-form-input>

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>
                    </b-form-row>

                    <b-form-row>
                      <b-col md="6">
                        <ValidationProvider
                          name="Address"
                          :rules="{ required: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label="Address*"
                            label-for="street"
                            label-align="center"
                          >
                            <b-form-input
                              id="street"
                              v-model="street"
                              :state="getValidationState(validationContext)"
                            ></b-form-input>

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>

                      <b-col md="6">
                        <b-form-group
                          label="Unit / Apt Number"
                          label-for="unitApt"
                          label-align="center"
                        >
                          <b-form-input
                            id="unitApt"
                            v-model="unitApt"
                          ></b-form-input>
                        </b-form-group>
                      </b-col>
                    </b-form-row>

                    <b-form-row>
                      <b-col md="6">
                        <ValidationProvider
                          name="City"
                          :rules="{ required: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label="City*"
                            label-for="city"
                            label-align="center"
                          >
                            <b-form-input
                              id="city"
                              v-model="city"
                              :state="getValidationState(validationContext)"
                              @keypress="isLetter($event)"
                            ></b-form-input>

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>

                      <b-col md="2">
                        <ValidationProvider
                          name="State"
                          :rules="{ required: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label="State*"
                            label-for="state"
                            label-align="center"
                          >
                            <b-form-select
                              v-model="selectedState"
                              :state="getValidationState(validationContext)"
                              :options="parsedStates"
                              class="form-control"
                            >
                            </b-form-select>

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>

                      <b-col md="4">
                        <ValidationProvider
                          name="Zip Code"
                          :rules="{ required: true, min: 5, max: 5 }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label="Zip*"
                            label-for="zipCode"
                            label-align="center"
                          >
                            <b-form-input
                              id="zipCode"
                              v-model="zipCode"
                              v-mask="'#####'"
                              :state="getValidationState(validationContext)"
                            ></b-form-input>

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>
                    </b-form-row>

                    <b-form-row>
                      <b-col md="6">
                        <b-form-group
                          label="Date of birth*"
                          label-for="dateOfBirth"
                          label-align="center"
                        >
                          <b-form-row
                            ><b-col md="4">
                              <ValidationProvider
                                name="Month"
                                :rules="{ required: true }"
                                v-slot="validationContext"
                              >
                                <b-form-group>
                                  <b-form-select
                                    v-model="selectedMonth"
                                    @change="getdaysInMonth(selectedMonth)"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                    :options="months"
                                    id="dateOfBirth"
                                    class="form-control"
                                  >
                                  </b-form-select>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>

                            <b-col md="4">
                              <ValidationProvider
                                name="Day"
                                :rules="{ required: true }"
                                v-slot="validationContext"
                              >
                                <b-form-group>
                                  <b-form-select
                                    v-model="selectedDay"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                    @change="calculateAge()"
                                    :options="days"
                                    class="form-control"
                                  >
                                  </b-form-select>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>

                            <b-col md="4">
                              <ValidationProvider
                                name="Year"
                                :rules="{ required: true }"
                                v-slot="validationContext"
                              >
                                <b-form-group>
                                  <b-form-select
                                    v-model="selectedYear"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                    :options="years"
                                    @change="
                                      getMinimumAllowedBirthDate(selectedYear)
                                    "
                                    class="form-control"
                                  >
                                  </b-form-select>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>
                          </b-form-row>
                          <span
                            id="ageText"
                            ref="ageText1"
                            class="input-info"
                            hidden="false"
                            style="color: #e95a97"
                            >Age Must be 18 or above
                          </span>
                        </b-form-group>
                      </b-col>

                      <b-col md="6">
                        <b-form-group
                          label="Social Sec*"
                          label-for="socialSec"
                          label-align="center"
                        >
                          <b-form-row>
                            <b-col md="4">
                              <ValidationProvider
                                name="Social SEC"
                                :rules="{ required: true, min: 3, max: 3 }"
                                v-slot="validationContext"
                              >
                                <b-form-group>
                                  <b-form-input
                                    id="socialSec"
                                    ref="socialSec1"
                                    @keyup="ssnInputFocus()"
                                    v-mask="'###'"
                                    v-model="socialSec1"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                  ></b-form-input>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>

                            <b-col md="4">
                              <ValidationProvider
                                name="Social SEC "
                                :rules="{ required: true, min: 2, max: 2 }"
                                v-slot="validationContext"
                              >
                                <b-form-group>
                                  <b-form-input
                                    v-mask="'##'"
                                    v-model="socialSec2"
                                    ref="socialSec2"
                                    @keyup="ssnInputFocus()"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                  ></b-form-input>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>

                            <b-col md="4">
                              <ValidationProvider
                                name="Social SEC "
                                :rules="{ required: true, min: 4, max: 4 }"
                                v-slot="validationContext"
                              >
                                <b-form-group>
                                  <b-form-input
                                    v-mask="'####'"
                                    v-model="socialSec3"
                                    ref="socialSec3"
                                    @keyup="ssnInputFocus()"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                  ></b-form-input>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>
                          </b-form-row>
                        </b-form-group>
                      </b-col>
                    </b-form-row>

                    <b-form-row>
                      <b-col md="7">
                        <b-form-group
                          label="Drivers license number"
                          label-for="driversLicense"
                          label-align="center"
                        >
                          <b-form-row>
                            <b-col md="8">
                              <ValidationProvider
                                name="Drivers licence number"
                                v-slot="validationContext"
                                vid="driversLicenseNumber"
                              >
                                <b-form-group>
                                  <b-form-input
                                    v-model="driversLicenseNumber"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                    id="driversLicense"
                                  ></b-form-input>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>

                            <b-col md="4">
                              <ValidationProvider
                                name="Drivers licence state"
                                rules="required_if:driversLicenseNumber"
                                v-slot="validationContext"
                              >
                                <b-form-group>
                                  <b-form-select
                                    v-model="selectedDriversLicenseState"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                    :options="parsedStates"
                                    class="form-control"
                                  >
                                  </b-form-select>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>
                          </b-form-row>
                        </b-form-group>
                      </b-col>
                    </b-form-row>

                    <b-form-row
                      v-for="(phone, index) in phoneRecords"
                      :key="index"
                      style="margin-bottom: 45px"
                    >
                      <b-col md="7">
                        <b-form-row>
                          <b-col md="8">
                            <ValidationProvider
                              name="Phone"
                              :rules="{ required: true, min: 14, max: 14 }"
                              v-slot="validationContext"
                            >
                              <b-form-group
                                label="Phone*"
                                label-for="phone"
                                label-align="center"
                              >
                                <b-form-input
                                  id="phone"
                                  v-mask="'(###) ###-####'"
                                  v-model="phoneRecords[index].phone"
                                  :state="getValidationState(validationContext)"
                                ></b-form-input>

                                <b-form-invalid-feedback>{{
                                  validationContext.errors[0]
                                }}</b-form-invalid-feedback>
                              </b-form-group>
                            </ValidationProvider>
                          </b-col>

                          <b-col md="4">
                            <ValidationProvider
                              name="Primary type"
                              :rules="{ required: true }"
                              v-slot="validationContext"
                            >
                              <b-form-group
                                label="Primary type*"
                                label-for="phoneRecords"
                                label-align="center"
                              >
                                <b-form-select
                                  v-model="phoneRecords[index].type"
                                  :state="getValidationState(validationContext)"
                                  :options="phoneTypes"
                                  class="form-control"
                                >
                                </b-form-select>

                                <b-form-invalid-feedback>{{
                                  validationContext.errors[0]
                                }}</b-form-invalid-feedback>
                              </b-form-group>
                            </ValidationProvider>
                          </b-col>
                        </b-form-row>
                      </b-col>
                      <b-col md="4">
                        <b-form-group v-if="index <= 0">
                          <a
                            class="
                              btn btn-link
                              text-primary text-left
                              add-phone
                            "
                            @click.prevent="addPhoneRecord"
                          >
                            <div class="icon-plus">
                              <span>+</span>
                            </div>
                            <span>Add Phone</span>
                          </a>
                        </b-form-group>
                        <b-form-group v-else>
                          <a
                            class="
                              btn btn-link
                              text-primary text-left
                              remove-phone
                            "
                            @click.prevent="() => removePhoneRecord(index)"
                          >
                            <div class="icon-plus">
                              <span>-</span>
                            </div>
                            <span>Remove Phone</span>
                          </a>
                        </b-form-group>
                      </b-col>
                    </b-form-row>

                    <div class="form-section-label">Income</div>

                    <b-form-row>
                      <b-col md="6">
                        <ValidationProvider
                          name="Gross Annual Income"
                          :rules="{ required: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label="Gross Annual Income*"
                            label-for="annualIncome"
                            label-align="center"
                          >
                            <b-form-input
                              id="annualIncome"
                              v-mask="incomeMask"
                              v-model="annualIncome"
                              :state="getAnnualIncomeValidationState()"
                            ></b-form-input>
                            <span class="input-info"
                              >Must be greater than $12K per year
                            </span>

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>

                      <b-col md="6">
                        <ValidationProvider
                          name="Requested Amount"
                          :rules="{ required: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label="Requested Amount*"
                            label-for="requestedAmount"
                            label-align="center"
                          >
                            <b-form-input
                              id="requestedAmount"
                              v-mask="requestedAmountMask"
                              v-model="requestedAmount"
                              :state="getRequestedAmountValidationState()"
                            ></b-form-input>
                            <span class="input-info"
                              >Must be between $1000 and $7000</span
                            >

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>
                    </b-form-row>

                    <div class="form-section-label">Login Information</div>

                    <b-form-row>
                      <b-col md="4">
                        <ValidationProvider
                          name="Email"
                          :rules="{ required: true, email: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label="Email*"
                            label-for="email"
                            label-align="center"
                          >
                            <b-form-input
                              id="email"
                              v-model="email"
                              :state="getValidationState(validationContext)"
                            ></b-form-input>

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>

                      <b-col md="4">
                        <ValidationProvider
                          name="Password"
                          :rules="{ required: true, password: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label-for="password"
                            label-align="center"
                          >
                            <template v-slot:label>
                              <span>Password*</span>
                              <div class="couponcode">
                                <i
                                  class="far fa-question-circle"
                                  style="vertical-align: center"
                                ></i>
                                <span class="coupontooltip"
                                  >A strong password is necessary in order to
                                  save your application, establish user portal,
                                  and view important customer information.</span
                                >
                              </div>
                            </template>

                            <b-form-input
                              type="password"
                              id="password"
                              v-model="password"
                              :state="getValidationState(validationContext)"
                            ></b-form-input>

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>

                      <b-col md="4">
                        <ValidationProvider
                          name="Password"
                          :rules="{ required: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label-for="confirmPassword"
                            label-align="center"
                          >
                            <template v-slot:label>
                              <span>Confirm Password*</span>
                              <div class="couponcode">
                                <i
                                  class="far fa-question-circle"
                                  style="vertical-align: center"
                                ></i>
                                <span class="coupontooltip"
                                  >A strong password is necessary in order to
                                  save your application, establish user portal,
                                  and view important customer information.</span
                                >
                              </div>
                            </template>

                            <b-form-input
                              type="password"
                              id="confirmPassword"
                              v-model="passwordConfirmation"
                              :state="
                                getPasswordValidationState(validationContext)
                              "
                            ></b-form-input>

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>
                    </b-form-row>

                    <div class="custom-control custom-checkbox check-agreement">
                      <br />

                      <b-form-checkbox
                        v-model="FCRAAgreement"
                        @input="onCheckboxInput('FCRAAgreement')"
                      >
                        <label :class="{ 'has-error': errors.FCRAAgreement }">
                          By checking the box you are providing "written
                          instructions" to LaserAway, its representatives,
                          successors and assigns under the Fair Credit Reporting
                          Act to obtain information from your personal credit
                          profile and other information that may be provided by
                          Transunion. You authorize LaserAway to obtain such
                          information solely to conduct a pre-qualification for
                          credit. LaserAway may share the pre-qualification with
                          your Healthcare Provider and its lending partners as
                          needed. For this pre-qualification form we will accept
                          all household income in consideration for repaying
                          this loan. However, alimony, child support or separate
                          maintenance income need not be revealed if you do not
                          wish to have it considered as a basis for repaying
                          this obligation.
                        </label>
                      </b-form-checkbox>
                      <span class="input-error" v-if="errors.FCRAAgreement"
                        >{{ errors.FCRAAgreement }}<br
                      /></span>
                      <br />

                      <b-form-checkbox
                        v-model="inquiryAgreement"
                        @input="onCheckboxInput('inquiryAgreement')"
                      >
                        <label
                          :class="{ 'has-error': errors.inquiryAgreement }"
                        >
                          When obtaining a pre-qualification through this
                          program a soft inquiry will be performed on your
                          credit report which will not impact your credit score.
                          However, if you accept a loan offer from this program
                          or its providers and submit it for review, a hard
                          inquiry will be performed which may impact your credit
                          score and can be viewed by third parties.
                        </label>
                      </b-form-checkbox>

                      <span class="input-error" v-if="errors.inquiryAgreement"
                        >{{ errors.inquiryAgreement }}<br
                      /></span>
                      <br />

                      <b-form-checkbox
                        v-model="esignatureAgreement"
                        @input="onCheckboxInput('esignatureAgreement')"
                      >
                        <label
                          :class="{ 'has-error': errors.esignatureAgreement }"
                        >
                          By checking the box you confirm that you have read,
                          understand and accept LaserAway’s
                          <span style="font-weight: bold">
                            <br />
                            Terms of Use,
                          </span>
                          <a
                            href="#"
                            @click.prevent="showModalSMS = true"
                            class="applyLink"
                          >
                            Text &amp; Call Policy
                          </a>
                          <a
                            href="https://www.laseraway.com/privacy/"
                            target="_blank"
                            class="applyLink"
                          >
                            and Privacy Notice</a
                          >
                        </label>
                      </b-form-checkbox>
                      <span
                        class="input-error"
                        v-if="errors.esignatureAgreement"
                        >{{ errors.esignatureAgreement }}<br
                      /></span>
                      <br />

                      <b-form-checkbox
                        v-model="termsAgreement"
                        @input="onCheckboxInput('termsAgreement')"
                      >
                        <label :class="{ 'has-error': errors.termsAgreement }">
                          By checking the box you confirm that you have read and
                          agree to the
                          <a
                            href="#"
                            @click.prevent="showModalElectr = true"
                            class="applyLink"
                          >
                            e-sign consent</a
                          >, have the required hardware and software described
                          in the consent, and are able to access and retain the
                          Records, you consent to receiving Records in
                          electronic format, and you agree to execute all
                          documents to be signed in connection with your
                          purchase with an electronic signature.
                        </label>
                      </b-form-checkbox>
                      <span class="input-error" v-if="errors.termsAgreement"
                        >{{ errors.termsAgreement }}<br
                      /></span>
                      <br />
                    </div>

                    <div class="form-group text-right">
                      <button
                        type="submit"
                        class="btn btn-primary btn-lg submit-form-lg"
                        style="color: #fff"
                        :disabled="isSubmitting"
                      >
                        Next
                      </button>
                    </div>
                  </b-form>
                </ValidationObserver>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VueFinalModal
        v-model="showModalSMS"
        classes="modal-container"
        content-class="modal-content"
      >
        <span class="modal__title"
          ><h4
            style="margin-bottom: 10px; text-align: center; font-weight: 500"
          >
            LASERAWAY SMS Text Message Policy
          </h4></span
        >
        <div class="modal__content">
          <p class="SMSParagraph">
            <strong>Calls and Text Messages from LaserAway</strong>: By
            providing us your wireless (cell) telephone number, you expressly
            consent to receiving telephone calls from us concerning your
            contract, including calls to collect what you owe. Live calls may be
            made by one of our employees. Calls may also be made by a
            prerecorded, auto-dialed voice or text message as applicable law
            allows. Your consent covers all types of calls related to your
            contract. We do not charge you for such calls. Your wireless carrier
            may charge you for our incoming calls and text messages according to
            your plan.
          </p>
          <h5 style="text-align: center">Opt-out or STOP</h5>
          <p class="SMSParagraph" style="text-align: center">
            If you wish to stop receiving text messages from LaserAway, reply
            STOP to any text message sent.
          </p>
          <h5>Help or Support</h5>
          <p class="SMSParagraph">
            If at any time you need contact information or information on how to
            stop text messages, reply to any text message sent by replying
            <strong>HELP</strong>.
          </p>
          <p class="SMSParagraph">
            Any questions regarding this policy or to have a copy of the policy
            mailed to your address of record please contact:
          </p>
          <p class="SMSParagraph">LaserAway</p>
          <p class="SMSParagraph">10100 Santa Monica Blvd, Los Angeles</p>
          <p class="SMSParagraph">no-reply@patrialending.com</p>
          <p class="SMSParagraph">1-888-965-2737</p>
          <br />
          <p class="SMSParagraph">
            LaserAway is licensed by the California Department of Business
            Oversight pursuant to the California Financing Law. License number
            605 4855.
          </p>
          <br />
          <p class="SMSParagraph">Date: {{ todayDate }}</p>
          <br />
          <p class="SMSParagraph">Ip: {{ ip }}</p>
          <div class="text-center" style="margin-bottom: 20px">
            <button
              type="button"
              data-dismiss="modal"
              @click="showModalSMS = false"
              class="
                btn-application btn btn-primary btn-lg
                submit-form-lg
                finalizeButton
              "
            >
              Continue
            </button>
          </div>
        </div>
      </VueFinalModal>

      <VueFinalModal
        v-model="showModalElectr"
        classes="modal-container"
        content-class="modal-content"
      >
        <span class="modal__title">
          <h4 style="margin: 0px; text-align: center">
            Consent to Receive Electronic Disclosures
          </h4>
        </span>
        <br />

        <div class="modal__content" style="padding: 0 10px 0 10px">
          <div class="esigndiv">
            <p>
              In this Consent to Receive Electronic Disclosures, “you” and
              “your” refer to each customer who wants to purchase services and
              related products from us; “we,” “us” and “our” refer LaserAway.
            </p>
            <br />

            <p>
              We need to provide you with certain disclosures and information
              concerning your purchase and any related financing transaction. In
              order to deliver these disclosures and information to you in an
              electronic format, you must first read this Consent to Receive
              Electronic Disclosures and affirmatively consent to receive
              disclosures electronically. Your consent to receive electronic
              disclosures allows us to give you federal and state disclosures
              concerning your purchase and any related financing transaction in
              the electronic format described below and to communicate with you
              electronically. Please read this consent carefully. If you do not
              wish to receive such information in electronic format, you should
              not consent, and we will provide the information in paper form.
            </p>
            <br />

            <p>
              <strong>Records Covered by Consent; Electronic Signature:</strong>
              By consenting to receive electronic disclosures, you agree that we
              may send you communications, information and disclosures
              concerning your purchase and any related financing transaction
              electronically (“Records”). If you are financing your purchase
              with us, the Records will include a retail installment credit
              agreement and related Truth in Lending disclosures. You also agree
              to execute all documents to be signed in connection with your
              purchase with an electronic signature.
            </p>
            <br />

            <p>
              <strong>Receiving a Paper Copy:</strong>
              You may request a paper copy of the Records at the time of your
              purpose or by emailing us at
              <a href="mailto: FinanceSupport@laseraway.net">
                FinanceSupport@laseraway.net
              </a>
              calling us at <b>475 298 1765</b>, or writing us at 400 Spectrum
              Center Drive, Ste 350, Irvine, CA 92618. You will not be charged a
              fee for the first paper copy of a Record.
            </p>
            <br />

            <p>
              <strong
                >Withdrawing Your Consent to Receive Electronic Records:
              </strong>
              You may withdraw your consent to receive electronic Records,
              without charge, by emailing us at
              <a href="mailto: FinanceSupport@laseraway.net">
                FinanceSupport@laseraway.net
              </a>
              calling us at <b>475 298 1765</b>, or writing us at 400 Spectrum
              Center Drive, Ste 350, Irvine, CA 92618. Your withdrawal of
              consent will be effective as soon as possible, but no later than 5
              business days after we receive a request as provided above.
            </p>
            <br />

            <p style="margin-bottom: 1px">
              <strong>Hardware and Software Requirements:</strong>
              In order to receive, access and retain Records electronically, you
              will need to have the following hardware and software:
            </p>
            <ul>
              <li>Internet access with 128-bit encryption</li>
              <li>An active email account</li>
              <li>
                Software that permits you to receive and view Portable Document
                Format (PDF) files, such as Adobe Acrobat Reader (available for
                free download at
                <a href="http://get.adobe.com/reader/">
                  http://get.adobe.com/reader/
                </a>
                )
              </li>
              <li>Ability to print and/or download and store documents</li>
            </ul>
            <br />

            <p style="margin-bottom: 1px">
              By agreeing to the terms of this Consent to Electronic Records,
              Signatures, Disclosures, and Communication, You Consent to the
              following: You
            </p>
            <ul>
              <li>
                Acknowledge that You have the technical ability to access and
                retain the Electronic Records in the designated formats
                described above;
              </li>
              <li>
                Acknowledge that You have read the information about Electronic
                Records, Signatures, Disclosures, and Communications;
              </li>
              <li>
                Consent to having (i) legally required disclosures, agreements,
                Account information, notices, statements, and other information
                provided or made available to You in electronic form and (ii)
                doing business with Us electronically;
              </li>
              <li>
                Acknowledge that You may request a paper copy of an Electronic
                Record at no charge to You; and
              </li>
              <li>
                Indicate Your intent to utilize electronic signatures to apply
                for credit and agree to transactions on Your Account.
              </li>
            </ul>
          </div>
          <p style="margin: 0 20px; text-align: center">
            BY CHECKING THE CONSENT BOX, I AGREE TO THIS E-SIGN DISCLOSURE AND
            CONSENT
          </p>
          <p style="margin: 10px" class="ipDatePdf">Date: {{ todayDate }}</p>
          <br />
          <p style="margin: 10px" class="ipDatePdf">Ip: {{ ip }}</p>
          <div class="text-center" style="margin-bottom: 20px">
            <button
              type="button"
              data-dismiss="modal"
              @click="showModalElectr = false"
              class="
                btn-application btn btn-primary btn-lg
                submit-form-lg
                finalizeButton
              "
            >
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
import { extend } from "vee-validate";
import createNumberMask from "text-mask-addons/dist/createNumberMask";

import states from "@/helpers/states";
import showErrorToast from "@/helpers/errorToast";
import Layout from "../../layout/pages/Layout.vue";
import { createUser, runCreditReport } from "../api";
import { login } from "@/user-application/authentication/api";

const incomeMask = createNumberMask({
  prefix: "$",
  allowDecimal: true,
  includeThousandsSeparator: true,
  allowNegative: false,
  integerLimit: 7,
});

const requestedAmountMask = createNumberMask({
  prefix: "$",
  allowDecimal: true,
  includeThousandsSeparator: true,
  allowNegative: false,
  integerLimit: 4,
});

extend("password", (value: string) => {
  if (/^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/.test(value)) {
    return true;
  }
  return "Password should be at least 8 characters long and should have at least 1 number";
});

export default Vue.extend({
  components: {
    Layout,
  },

  props: {
    practiceManagementId: {
      required: false,
      type: String,
    },
  },

  data() {
    return {
      annualIncome: null as null | string,
      city: null as null | string,
      days: [] as { value: string; text: string }[],
      driversLicenseNumber: null as null | string,
      driversLicenseState: null as null | string,
      email: null as null | string,
      errors: {} as Record<string, unknown>,
      esignatureAgreement: false,
      FCRAAgreement: false,
      firstName: null as null | string,
      ip: null as null | string,
      inquiryAgreement: false,
      isSubmitting: false,
      lastName: null as null | string,
      incomeMask,
      requestedAmountMask,
      middleInitial: null,
      months: [] as { text: string; value: string }[],
      password: null as null | string,
      passwordConfirmation: null as null | string,
      phoneRecords: [{ phone: "", type: "home" }] as {
        phone: string;
        type: "mobile" | "home" | "office";
      }[],
      requestedAmount: null as null | string,
      selectedDay: null as null | string,
      selectedDriversLicenseState: null as null | string,
      selectedMonth: null as null | string,
      selectedState: null as null | string,
      selectedYear: null as null | string,
      showModalCallPolicy: false,
      showModalCredit: false,
      showModalElectr: false,
      showModalSMS: false,
      socialSec1: null as null | string,
      socialSec2: null as null | string,
      socialSec3: null as null | string,
      state: null as null | string,
      states: states as { state: string; stateCode: null | string }[],
      street: null as null | string,
      term: null as null | string,
      termsAgreement: false,
      unitApt: null as null | string,
      years: [] as { text: string; value: string }[],
      zipCode: null as null | string,
    };
  },

  computed: {
    todayDate(): string {
      return moment().format("MM/DD/YYYY");
    },

    parsedStates(): { value: string | null; text: string }[] {
      return this.states.map((state) => {
        return {
          value: state.stateCode,
          text: state.state,
        };
      });
    },
    // TODO refactor this
    parsedAnualIncome(): number {
      if (typeof this.annualIncome === "string") {
        return +this.annualIncome.replace(/[$,]/g, "");
      } else {
        return 0;
      }
    },
    parsedRequestedAmount(): number {
      if (typeof this.requestedAmount === "string") {
        return +this.requestedAmount.replace(/[$,]/g, "");
      } else {
        return 0;
      }
    },
    phoneTypes(): { value: string | null; text: string }[] {
      return [
        {
          value: null,
          text: "Select",
        },
        {
          value: "mobile",
          text: "Mobile",
        },
        {
          value: "home",
          text: "Home",
        },
        {
          value: "office",
          text: "Office",
        },
      ];
    },
    parsedPhones(): { phone: string; type: "mobile" | "home" | "office" }[] {
      return this.phoneRecords.map((item) => {
        return { phone: item.phone.replace(/[()\-\s]/g, ""), type: item.type };
      });
    },
  },

  beforeMount() {
    this.getIp();
    this.getdaysInMonth();
    this.getMonths();
    this.getYears();
  },

  methods: {
    ...mapMutations(["setIsLoading"]),
    currencyToNumber(value: string): number {
      return +value.replace(/[$,]/g, "");
    },
    ssnInputFocus() {
      if (this.socialSec1 && this.socialSec1.length == 3) {
        const ss2 = this.$refs.socialSec2 as any;
        ss2.focus();
      }
      if (
        this.socialSec2 &&
        this.socialSec2.length == 2 &&
        this.socialSec1 &&
        this.socialSec1.length == 3
      ) {
        const ss3 = this.$refs.socialSec3 as any;
        ss3.focus();
      }
    },
    getMinimumAllowedBirthDate(year: string) {
      const today = moment();
      const todayDay = today.date();
      const thisMonth = today.month();
      if (year === this.years[0].value) {
        this.days = this.days.filter((day) => {
          return +day.value >= todayDay;
        });
        if (this.selectedDay && +this.selectedDay < +this.days[0].value) {
          this.selectedDay = this.days[0].value;
        }

        this.months = this.months.filter((month) => {
          return +month.value;
        });

        if (this.selectedMonth && +this.selectedMonth < +this.months[0].value) {
          this.selectedMonth = this.months[0].value;
        }
        if (this.selectedMonth && +this.selectedMonth > this.months.length) {
          this.selectedMonth = this.months[0].value;
        }
      } else {
        let month = "";
        if (!this.selectedMonth) {
          const parsedMonth: string | number = thisMonth + 1;
          month = parsedMonth <= 9 ? `0${parsedMonth}` : `${parsedMonth}`;
        } else {
          month = this.selectedMonth;
        }

        this.getdaysInMonth(month);
        this.getMonths();
      }
      this.calculateAge();
    },
    calculateAge() {
      if (this.selectedDay && this.selectedMonth && this.selectedYear) {
        const dob =
          this.selectedYear + "-" + this.selectedMonth + "-" + this.selectedDay;

        const age = moment().diff(dob, "years", true);

        if (age < 18) {
          this.selectedMonth = null;
          this.selectedDay = null;
          this.selectedYear = null;
          const ageT = this.$refs.ageText1 as any;
          ageT.hidden = false;
        } else {
          const ageT = this.$refs.ageText1 as any;
          ageT.hidden = true;
        }
      }
    },
    getdaysInMonth(month?: string) {
      let daysInMonth = 31;
      const year = this.selectedYear ? +this.selectedYear : moment().year();
      const days: { value: string; text: string }[] = [];

      if (month) {
        switch (month) {
          case "04":
          case "06":
          case "09":
          case "11":
            daysInMonth = 30;
            break;
          case "02":
            // leap year
            if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
              daysInMonth = 29;
            } else {
              daysInMonth = 28;
            }
            break;
        }
      }

      for (let index = 1; index <= daysInMonth; index++) {
        if (index <= 9) {
          days.push({ value: `0${index}`, text: `0${index}` });
        } else {
          days.push({ value: `${index}`, text: `${index}` });
        }
      }

      this.days = days;
      // reset the selected day if previous selected day has more days and the last day of the month is greater than the last day of current month
      if (
        this.selectedDay &&
        +this.selectedDay > +days[days.length - 1].value
      ) {
        this.selectedDay = null;
      }

      this.calculateAge();
    },
    getMonths() {
      this.months = [
        {
          value: "01",
          text: "January",
        },
        {
          value: "02",
          text: "February",
        },
        {
          value: "03",
          text: "March",
        },
        {
          value: "04",
          text: "April",
        },
        {
          value: "05",
          text: "May",
        },
        {
          value: "06",
          text: "June",
        },
        {
          value: "07",
          text: "July",
        },
        {
          value: "08",
          text: "August",
        },
        {
          value: "09",
          text: "September",
        },
        {
          value: "10",
          text: "October",
        },
        {
          value: "11",
          text: "November",
        },
        {
          value: "12",
          text: "December",
        },
      ];
    },
    getYears() {
      const years: { value: string; text: string }[] = [];
      const currentYear = moment().year();
      const firstYear = currentYear - 100;
      let year = currentYear - 18;

      while (year >= firstYear) {
        years.push({ value: `${year}`, text: `${year}` });
        year--;
      }

      this.years = years;
    },

    onCheckboxInput(checkboxName: string) {
      if (this.errors[checkboxName]) {
        this.errors[checkboxName] = null;
      }
    },
    getIp() {
      fetch("https://api.ipify.org?format=json")
        .then((x) => x.json())
        .then(({ ip }) => {
          this.ip = ip;
        });
    },
    isLetter(event: KeyboardEvent) {
      const char = event.key;
      if (!/^[a-zA-Z\s]+$/.test(char)) {
        event.preventDefault();
      }
    },
    addPhoneRecord() {
      if (this.phoneRecords.length >= 5) {
        this.errors.phone = "Maximum of 5 phones allowed.";
        return;
      }
      this.phoneRecords.push({ phone: "", type: "home" });
    },
    removePhoneRecord(index: number) {
      this.phoneRecords.splice(index, 1);
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
    getPasswordValidationState({
      validated,
      valid = null,
    }: {
      validated: boolean;
      valid: null | boolean;
    }) {
      return validated
        ? valid &&
            this.password &&
            /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/.test(this.password) &&
            this.passwordConfirmation === this.password
        : null;
    },
    getAnnualIncomeValidationState() {
      const annualIncome = this.parsedAnualIncome;
      if (!annualIncome) {
        return null;
      }
      if (annualIncome < 12000) {
        return false;
      }
      return true;
    },
    getRequestedAmountValidationState() {
      const requestedAmount = this.parsedRequestedAmount;
      if (!requestedAmount) {
        return null;
      }
      if (requestedAmount < 1000 || requestedAmount > 7000) {
        return false;
      }

      return true;
    },
    async getValidationApply() {
      try {
        this.setIsLoading(true);
        this.isSubmitting = true;
        const createUserRequestBody = {
          annualIncome: this.parsedAnualIncome,
          city: this.city ? this.city : "",
          dateOfBirth:
            this.selectedYear && this.selectedMonth && this.selectedDay
              ? moment(
                  `${this.selectedYear}-${this.selectedMonth}-${this.selectedDay}`
                )
                  .startOf("day")
                  .toISOString()
              : "",
          driversLicenseNumber: this.driversLicenseNumber
            ? this.driversLicenseNumber
            : "",
          driversLicenseState: this.driversLicenseState
            ? this.driversLicenseState
            : "",
          email: this.email ? this.email.toLowerCase().trim() : "",
          firstName: this.firstName ? this.firstName : "",
          lastName: this.lastName ? this.lastName : "",
          password: this.password ? this.password : "",
          phones: this.parsedPhones,
          practiceManagement: this.practiceManagementId,
          requestedAmount: this.requestedAmount
            ? this.currencyToNumber(this.requestedAmount)
            : 0,
          source: "web" as "web" | "lead-list",
          ssnNumber:
            this.socialSec1 && this.socialSec2 && this.socialSec3
              ? `${this.socialSec1}${this.socialSec2}${this.socialSec3}`
              : "",
          state: this.selectedState ? this.selectedState : "",
          street: this.street ? this.street : "",
          unitApt: this.unitApt ? this.unitApt : "",
          zipCode: this.zipCode ? this.zipCode : "",
        };
        await createUser(createUserRequestBody);
        const loginRequestBody = {
          email: this.email ? this.email.toLowerCase().trim() : "",
          password: this.password ? this.password : "",
        };
        const { data: jwtToken } = await login(loginRequestBody);
        localStorage.setItem("userToken", JSON.stringify(jwtToken));

        const { data: creditReport } = await runCreditReport(jwtToken.token);
        if (!creditReport.isLoanApproved) {
          await this.$router.push({ name: "denied" });
        } else {
          this.setIsLoading(false);
          this.isSubmitting = false;
          await this.$router.push({ name: "offers" });
        }
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
    async onSubmit() {
      let isInvalid = false;
      if (!this.FCRAAgreement) {
        this.errors.FCRAAgreement =
          "Please agree with our Fair Credit Reporting Act policy.";
        isInvalid = true;
      }
      if (!this.inquiryAgreement) {
        this.errors.inquiryAgreement = "Please agree with our inquiry policy.";
        isInvalid = true;
      }
      if (!this.termsAgreement) {
        this.errors.termsAgreement =
          "Please agree with our Terms of Use policy.";
        isInvalid = true;
      }
      if (!this.esignatureAgreement) {
        this.errors.esignatureAgreement =
          "Please agree with our e-signature policy.";
        isInvalid = true;
      }

      if (isInvalid) {
        return;
      }

      try {
        this.isSubmitting = true;
        this.setIsLoading(true);
        const createUserRequestBody = {
          annualIncome: this.parsedAnualIncome,
          city: this.city ? this.city : "",
          dateOfBirth:
            this.selectedYear && this.selectedMonth && this.selectedDay
              ? moment(
                  `${this.selectedMonth}-${this.selectedDay}-${this.selectedYear}`,
                  "MM-DD-YYYY"
                ).format("MM-DD-YYYY")
              : "",
          driversLicenseNumber: this.driversLicenseNumber
            ? this.driversLicenseNumber
            : "",
          driversLicenseState: this.driversLicenseState
            ? this.driversLicenseState
            : "",
          email: this.email ? this.email.toLowerCase().trim() : "",
          firstName: this.firstName ? this.firstName : "",
          lastName: this.lastName ? this.lastName : "",
          password: this.password ? this.password : "",
          phones: this.parsedPhones,
          practiceManagement: this.practiceManagementId,
          requestedAmount: this.requestedAmount
            ? this.currencyToNumber(this.requestedAmount)
            : 0,
          source: "web" as "web" | "lead-list",
          ssnNumber:
            this.socialSec1 && this.socialSec2 && this.socialSec3
              ? `${this.socialSec1}${this.socialSec2}${this.socialSec3}`
              : "",
          state: this.selectedState ? this.selectedState : "",
          street: this.street ? this.street : "",
          unitApt: this.unitApt ? this.unitApt : "",
          zipCode: this.zipCode ? this.zipCode : "",
        };
        if (this.parsedAnualIncome >= 12000) {
          if (this.parsedRequestedAmount >= 1000 && this.parsedRequestedAmount <= 7000) {
            // Creates base user and screen_tracking documents with no offer info
            await createUser(createUserRequestBody);
            const loginRequestBody = {
              email: this.email ? this.email.toLowerCase().trim() : "",
              password: this.password ? this.password : "",
            };
            const { data: jwtToken } = await login(loginRequestBody);
            localStorage.setItem("userToken", JSON.stringify(jwtToken));
            // Pull credit report form TU, create payment_management document if denied from creditreport
            // Offer is generated when loading the offers page
            const { data: creditReport } = await runCreditReport(
              jwtToken.token
            );
            if (!creditReport.isLoanApproved) {
              await this.$router.push({ name: "denied" });
            } else {
              this.setIsLoading(false);
              this.isSubmitting = false;
              await this.$router.push({ name: "offers" });
            }
          } else {
            this.setIsLoading(false);
            this.isSubmitting = false;
            this.$swal
              .fire({
                title: "Requested amount must be between $1000 and $7000",
                showCancelButton: false,
                icon: "warning",
                reverseButtons: true,
                confirmButtonText: `Ok`,
              })
              .then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                  return false;
                }
              });
          }
        } else {
          this.setIsLoading(false);
          this.isSubmitting = false;
          this.$swal
            .fire({
              title:
                "Your gross annual income is less than $12k per year, would you like to continue? Press “Edit” to reenter your annual income amount.",
              showCancelButton: true,
              icon: "warning",
              reverseButtons: true,
              confirmButtonText: `Continue`,
              cancelButtonText: `Edit`,
            })
            .then((result) => {
              /* Read more about isConfirmed, isDenied below */
              if (result.isConfirmed) {
                this.getValidationApply();
              } else if (result.isDenied) {
                return false;
              }
            });
        }
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
</style>
