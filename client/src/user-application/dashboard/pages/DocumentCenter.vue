
<template>

  <div id="review-application">
    <div class="container">
      <div class="summary-row large-padding">


        <div class="summary-section">
          <div class="summary-row large-padding">
            <div class="summary-title ">LOAN DOCUMENTS</div>
            <div class="summary-action"></div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">E-SIGNATURE CONSENT</div>
            <div class="summary-value">
              <a v-bind:href="smsPolicyPath">download<i class="fas fa-download downloadDash">
                </i></a>
            </div>
          </div>

          <div v-if="passportPath" class="summary-row large-padding">
            <div class="summary-key width-40">Passport</div>
            <div class="summary-value">
              <a target="_blank" v-bind:href="passportPath">download<i class="fas fa-download downloadDash">
                </i></a>
            </div>
          </div>

          <div v-if="paystubPath" class="summary-row large-padding">
            <div class="summary-key width-40">Paystub</div>
            <div class="summary-value">
              <a target="_blank" v-bind:href="paystubPath">download<i class="fas fa-download downloadDash">
                </i></a>
            </div>
          </div>

          <div v-if="proofOfResidencePath" class="summary-row large-padding">
            <div class="summary-key width-40">Proof of Residence</div>
            <div class="summary-value">
              <a target="_blank" v-bind:href="proofOfResidencePath">download<i class="fas fa-download downloadDash">
                </i></a>
            </div>
          </div>

          <div v-if="otherDocPath" class="summary-row large-padding">
            <div class="summary-key width-40">{{ otherDocTitle || 'Other Document' }}</div>
            <div class="summary-value">
              <a target="_blank" v-bind:href="otherDocPath">download<i class="fas fa-download downloadDash">
                </i></a>
            </div>
          </div>

          <div v-if="driversLicensePaths" class="summary-row large-padding">
            <div class="summary-key width-40">Driver Licence</div>
            <div class="summary-value">
              <a target="_blank" v-bind:href="driversLicensePaths.front"> Front download<i
                  class="fas fa-download downloadDash">
                </i></a><br />
              <a v-bind:href="driversLicensePaths.back">Back download<i class="fas fa-download downloadDash">
                </i></a>
            </div>
          </div>

          <div class="summary-row large-padding">
            <div class="summary-title ">UPLOAD DOCUMENTS</div>
            <div class="summary-action"></div>
          </div>

          <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
            <b-form @submit.stop.prevent="handleSubmit(onSubmit)" id="desc">
              <table class="table table-bordered" style="border: none">
                <tbody>
                  <div id="docuCheck" style="display:none;">
                    <p>Please select</p>
                  </div>
                  <tr>
                    <th>Document Type</th>
                    <td>
                      <ValidationProvider name="Document Type" :rules="{ required: true }" v-slot="validationContext">
                        <b-form-group>
                          <b-form-select v-model="selectedDocumentType" :state="getValidationState(validationContext)"
                            :options="documentTypes" class="form-control">
                          </b-form-select>
                          <b-form-invalid-feedback>{{
                            validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                        </b-form-group>
                      </ValidationProvider>
                    </td>
                  </tr>

                  <tr v-if="selectedDocumentType">
                    <th>Document</th>
                    <td>
                      <div>
                        <div class="flex flex-column" style="margin-bottom: 10px;">
                          <Label v-if="selectedDocumentType === 'driversLicense'"
                            style="font-weight: bold;">Front</Label>
                          <ValidationProvider name="File Front" :rules="{ required: true }" v-slot="validationContext">
                            <b-form-group>
                              <b-form-file v-model="fileFront" placeholder="Choose a file or drop it here"
                                :state="getValidationState(validationContext)" drop-placeholder="Drop file here"
                                accept=".jpg, .png, .pdf" @change="onFileFrontSelected">
                              </b-form-file>
                              <b-form-invalid-feedback>{{
                                validationContext.errors[0]
                                }}</b-form-invalid-feedback>
                            </b-form-group>
                          </ValidationProvider>
                        </div>
                        <div v-if="selectedDocumentType === 'driversLicense'" class="flex flex-column">
                          <Label style="font-weight: bold;">Back</Label>
                          <ValidationProvider name="File Back" :rules="{ required: true }" v-slot="validationContext">
                            <b-form-group>
                              <b-form-file v-model="fileBack" placeholder="Choose a file or drop it here"
                                :state="getValidationState(validationContext)" drop-placeholder="Drop file here"
                                accept=".jpg, .png, .pdf" @change="onFileBackSelected">
                              </b-form-file>
                              <b-form-invalid-feedback>{{
                                validationContext.errors[0]
                                }}</b-form-invalid-feedback>
                            </b-form-group>
                          </ValidationProvider>
                        </div>

                        <div v-if="selectedDocumentType === 'other'" style="margin-bottom: 10px;">
                          <Label style="font-weight: bold;">Document Title</Label>
                          <ValidationProvider name="File Front" :rules="{ required: true }" v-slot="validationContext">
                            <b-form-group>
                              <b-form-input type="text" class="form-control w-100" size="sm" v-model="otherDocTitle"
                                @change="onOtherDocTitleChange" />
                              <b-form-invalid-feedback>{{
                                validationContext.errors[0]
                                }}</b-form-invalid-feedback>
                            </b-form-group>
                          </ValidationProvider>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" align="center">
                      <button :disabled="isLoading" type="submit" class="btn btn-primary"
                        style="font-weight: bold; text-align: center; border-radius: 15px;" id="updocs">
                        <span>Submit</span>
                        <b-spinner small v-show="isLoading"></b-spinner>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </b-form>
          </ValidationObserver>

          <div v-for="(efta, index) in eftaConsents" :key="efta._id" class="summary-row large-padding">
            <div class="summary-key width-40">
              ELECTRONIC FUNDS TRANSFER AUTHORIZATION {{ index + 1 }}
            </div>
            <div class="summary-value">
              <a v-bind:href="efta.agreementDocumentPath"><i class="fas fa-download downloadDash"></i></a>
            </div>
          </div>
        </div>
        <div class="summary-section">
          <div class="summary-row large-padding">
            <!-- <div class="summary-title ">USER DOCUMENTS</div> -->
            <div class="summary-action"></div>
          </div>
          <!-- <div v-for="(doc) in this.documentsData" :key="doc._id">
            <div v-if="this.passportPath" class="summary-row large-padding">
              <div class="summary-key width-40">
                YOUR PASSPORT
              </div>
              <div class="summary-value">
                <a v-bind:href="this.passportPath"><i class="fas fa-download downloadDash"></i></a>
              </div>
            </div>
            <div v-if="doc.paystub" class="summary-row large-padding">
              <div class="summary-key width-40">
                YOUR PAYSTUB
              </div>
              <div class="summary-value">
                <a v-bind:href="doc.paystub"><i class="fas fa-download downloadDash"></i></a>
              </div>
            </div>

            <div v-else-if="this.driversLicensePath">
              <div v-if="doc.driversLicense" class="summary-row large-padding">
                <div class="summary-key width-40">FRONT SIDE OF YOUR ID Driver</div>
                <div class="summary-value">
                  <a v-bind:href="doc.driversLicense.front">download<i class="fas fa-download downloadDash"></i></a>
                </div>
              </div>
              <div v-if="doc.driversLicense" class="summary-row large-padding">
                <div class="summary-key width-40">BACK SIDE OF YOUR ID Driver</div>
                <div class="summary-value">
                  <a v-bind:href="doc.driversLicense.back">download<i class="fas fa-download downloadDash"></i></a>
                </div>
              </div>

            </div>
          </div> -->


        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { errorHandler } from "@/api/error-handler";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { adminDashboardRequests } from "@/api/admin-dashboard";
export default Vue.extend({
  components: {
  },
  props: ['UserInfoData', 'DashboardData', 'DocumentData'],
  async created() {
    try {
      const {
        address,
        annualIncome,
        approvedUpTo,
        city,
        email,
        firstName,
        lastName,
        phones,
        referenceNumber,
        applicationReference,
        requestedAmount,
        selectedOffer,
        ssn,
        state,
        zip,
        screenTrackingId,
      } = this.UserInfoData;
      this.address = address;
      this.annualIncome = annualIncome;
      this.approvedUpTo = approvedUpTo;
      this.city = city;
      this.email = email;
      this.firstName = firstName;
      this.lastName = lastName;
      this.phones = phones;
      this.referenceNumber = referenceNumber;
      this.areferenceNumber = applicationReference;
      this.requestedAmount = requestedAmount;
      this.selectedOffer = selectedOffer;
      this.ssn = ssn;
      this.state = state;
      this.zip = zip;

      const {
        driversLicensePaths,
        esignaturePath,
        paymentManagementData,
        ricPath,
        eftaPath,
        eftaConsents,
        userDocuments,
        smsPolicyPath,
        passportPath,
        otherDocPath,
        otherDocTitle,
        paystubPath,
        proofOfResidencePath,
      } = this.DashboardData;
      this.driversLicensePaths = driversLicensePaths;
      this.esignaturePath = esignaturePath;
      this.paymentManagementData = paymentManagementData;
      this.ricPath = ricPath;
      this.eftaPath = eftaPath;
      this.smsPolicyPath = smsPolicyPath;
      this.documentsData = userDocuments;
      this.eftaConsents = eftaConsents;
      this.passportPath = passportPath;
      this.paystubPath = paystubPath;
      this.proofOfResidencePath = proofOfResidencePath;
      this.otherDocPath = otherDocPath;
      this.otherDocTitle = otherDocTitle;

    } catch (error) {
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


  data() {
    return {
      address: null as null | string,
      annualIncome: null as null | number,
      approvedUpTo: null as null | number,
      city: null as null | string,
      driversLicensePaths: null as null | Record<string, unknown>,
      proofOfResidencePath: null as null | string,
      eftaPath: null as null | string,
      email: null as null | string,
      esignaturePath: null as null | string,
      firstName: null as null | string,
      lastName: null as null | string,
      passportPath: null as null | string,
      paymentManagementData: null as null | Record<string, any>,
      phones: [] as { phone: string; type: "home" | "mobile" | "office" }[],
      referenceNumber: null as null | string,
      areferenceNumber: null as null | string,
      requestedAmount: null as null | number,
      ricPath: null as null | string,
      selectedOffer: null as null | Record<string, any>,
      smsPolicyPath: null as null | string,
      ssn: null as null | string,
      state: null as null | string,
      zip: null as null | string,
      eftaConsents: [],
      documentsData: [],
      paystubPath: null,
      selectedDocumentType: null,
      fileFront: null as null | File,
      fileFrontBase64: null as null | string,
      fileFrontName: null as null | string,
      fileBack: null as null | File,
      fileBackBase64: null as null | string,
      fileBackName: null as null | string,
      isLoading: false,
      userDocuments: [],
      userConsents: [],
      otherDocPath: null as null | string,
      otherDoc: null as null | string,
      otherDocTitle: null as null | string,

      documentTypes: [
        {
          value: null,
          text: "Select Document Type",
        },
        {
          value: "driversLicense",
          text: "Driver's License or ID",
        },
        {
          value: "passport",
          text: "Passport",
        },
        {
          value: "paystub",
          text: "Pay Stub",
        },
        {
          value: "proofOfResidence",
          text: "Proof of Residence",
        },
        {
          value: "other",
          text: "Others",
        },
      ],
    };
  },

  computed: {
  },

  methods: {
    getValidationState({ validated, valid = null }: any) {
      return validated ? valid : null;
    },
    onOtherDocTitleChange(e: any) {
      const value = e.target.value;
      this.otherDocTitle = value;
    },
    cleanState() {
      this.selectedDocumentType = null;
      this.fileFront = null;
      this.fileFrontBase64 = null;
      this.fileFrontName = null;
      this.fileBack = null;
      this.fileBackBase64 = null;
      this.fileBackName = null;

      this.$nextTick(() => {
        (this.$refs.observer as any).reset();
      });
    },
    async loadUserDocuments() {
      try {
        // const { data } = await adminDashboardRequests.getUserDocuments(
        //   this.screenTrackingId
        // );
        // this.userDocuments = data;
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
    async onSubmit() {
      const screenTrackingId = this.UserInfoData?.screenTrackingId;
      const userId = this.UserInfoData?.userId;

      this.isLoading = true;
      const requestBody: any = {};
      requestBody.userId = userId;
      if (this.selectedDocumentType === "passport") {
        requestBody.documentType = "passport";
        requestBody.passport = this.fileFrontBase64;
      } else if (this.selectedDocumentType === "driversLicense") {
        requestBody.documentType = "drivers license";
        requestBody.driversLicenseFront = this.fileFrontBase64;
        requestBody.driversLicenseBack = this.fileBackBase64;
      } else if (this.selectedDocumentType === "other") {
        requestBody.documentType = 'otherDoc'
        requestBody.otherDocTitle = this.otherDocTitle;
        this.$set(requestBody, 'otherDoc', this.fileFrontBase64)
      } else {
        requestBody.documentType = this.selectedDocumentType;
        this.$set(requestBody, requestBody.documentType, this.fileFrontBase64)
        // requestBody = this.fileFrontBase64;
      }

      try {

        await adminDashboardRequests.userUploadDocument(
          screenTrackingId,
          requestBody
        );

        this.cleanState();
        this.isLoading = false;
        await this.$swal({
          title: "Success!",
          text: "Document(s) uploaded successfully.",
          icon: "success",
        });

        await this.loadUserDocuments();
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
      }
    },
    onFileFrontSelected(event: any) {
      const selectedImage =
        event.dataTransfer?.files[0] || event.target?.files[0];
      this.fileFrontName =
        event.dataTransfer?.files[0].name || event.target?.files[0].name;
      const reader = new FileReader();
      reader.onload = (event) => {
        this.fileFrontBase64 = (event.target?.result as string).split(
          "base64,"
        )[1];
      };
      reader.readAsDataURL(selectedImage);
    },
    onFileBackSelected(event: any) {
      const selectedImage =
        event.dataTransfer?.files[0] || event.target?.files[0];
      this.fileBackName =
        event.dataTransfer?.files[0].name || event.target?.files[0].name;
      const reader = new FileReader();
      reader.onload = (event) => {
        this.fileBackBase64 = (event.target?.result as string).split(
          "base64,"
        )[1];
      };
      reader.readAsDataURL(selectedImage);
    },
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

.customer-dashboard-page ul.tabs {
  display: inline-block;
  vertical-align: top;
  position: relative;
  z-index: 10;
  margin: 0;
  padding: 0;
  width: 33%;
  min-width: 175px;
  list-style: none;
  -ms-transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
  box-shadow: none;
}

.customer-dashboard-page ul.tabs li {
  margin: 0;
  cursor: pointer;
  padding: 10px 15px;
  line-height: 31px;
  color: #4c4c48;
  text-align: left;
  font-weight: normal;
  -ms-transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
}

.customer-dashboard-page ul.tabs li .tabs-text {
  margin-left: 5px;
}

.customer-dashboard-page ul.tabs li:hover {
  background-color: var(--dashboard-bg-color);
  outline: none;
  -ms-transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
}

.customer-dashboard-page ul.tabs li.active {
  margin-bottom: 10px;
  background: var(--primary-color);
  color: #fff;
  -ms-transition: all 0.3s ease;
  -webkit-transition: all 0.3s ease;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px 0px rgba(0, 0, 0, 0.14),
    0 7px 10px -5px rgb(233 111 161);
}

.customer-dashboard-page .tab_container {
  display: inline-block;
  vertical-align: top;
  position: relative;
  z-index: 20;
  left: 1%;
  width: 100%;
  min-width: 10px;
  text-align: left;
  border-radius: 0;
  box-shadow: none;
}

.customer-dashboard-page .tab_content {
  padding: 0px 20px;
  display: none;
  /*background:#FFF !important;*/
}

.customer-dashboard-page hr {
  border-bottom: 2px solid var(--primary-color);
  margin: 0 10px 0 0;
}

.dashboard-bottom tr,
.dashboard-bottom tr th,
.dashboard-bottom tr td {
  text-align: left;
}

#dashboardtitles {
  font-size: 36px;
  padding-left: 30px;
  font-weight: 330;
}

.doc-item {
  font-size: 17px;
}

.profileInfo {
  font-size: 17px;
  color: #606060;
  margin-left: 15px;
  padding-top: 5px !important;
}

.emailIcon {
  color: #63944c;
}

button {
  margin: 20px;
}

.sidemenu {
  font-size: 16px;
  margin: 10px;
  border-radius: 5px;
}

#dashboardUserDocsTitles {
  margin: 15px;
  padding-bottom: 10px;
}

.dashboardLoanDetailsTitles {
  font-size: 17px;
  margin: 15px 0 0 15px;
}

.dashboardLoanDetailsTitles hr {
  border: 1px solid var(--primary-color);
}

.dashboardTitles.main-container {
  font-size: 22px;
}

.customer-dashboard-page .card-tableCard {
  padding: 12px;
}

.displayDocs {
  padding: 5px 20px 5px 0;
  display: flex;
  border-bottom: 1px solid #3f576c;
  margin-left: 15px;
}

.displayDocs .doc-item {
  flex: 1 1 auto;
  padding: 10px;
  align-self: center;
}

.displayDocs .doc-item>div:last-child {
  float: right;
}

#docName {
  padding-left: 35px;
}

.plusMinusToggleFormat {
  float: right;
  color: var(--primary-color);
  padding-right: 30px;
  padding-left: 10px;
}

.loanDetailsTableDivs {
  padding-right: 20px;
  padding-left: 15px;
  color: #606060;
}

.hoverPointer:hover {
  cursor: pointer;
}

#promnoteModal {
  padding-right: 0px !important;
}

.displayDocs .doc-item .iconify {
  width: 25px;
  height: 25px;
  color: var(--secondary-color);
}

.displayDocs .doc-item .iconify:hover {
  color: var(--primary-color);
}

.dashboard-grid {
  margin: auto;
  padding-right: 20px;
  padding-bottom: 50px;
}

.profileInfo .header-item {
  flex: 0 0 100px;
}

.profileInfo.flex-box-item.flex-box-table-row {
  border-bottom: 1px solid #606060;
}

.dashboard-grid .profileInfo .flex-box-item:not(.header-item) {
  word-break: break-word;
}

.isa-contract-section .flex-box-table-col .flex-box-item,
.isa-contract-details-section .flex-box-table-row .flex-box-item {
  border-right: 1px solid #606060;
  border-bottom: 1px solid #606060;
}

.isa-contract-section.flex-box-table-col.flex-box-item {
  border: 0 !important;
}

.isa-contract-section .flex-box-table-col.flex-box-item:last-child .flex-box-item,
.isa-contract-details-section .flex-box-table-row .flex-box-item:last-child {
  border-right: 0;
}

.customer-portal-title {
  font-size: 25px;
  text-align: left;
  margin-left: 20px;
}

.tab_content .card-innerCard {
  margin: 20px;
  border-radius: var(--secondary-border-radius);
}

@media (max-width: 991px) {
  .isa-contract-section.flex-box-table-row {
    flex-direction: column;
  }

  .isa-contract-section.flex-box-table-row .flex-box-table-col {
    flex-direction: row;
  }

  .isa-contract-details-section.flex-box-table-col {
    flex-direction: column;
  }

  .isa-contract-section .flex-box-table-col .flex-box-item:first-child {
    border-right: 1px solid #606060 !important;
  }

  .isa-contract-section .flex-box-table-col .flex-box-item:last-child {
    border-right: 0;
  }

  .payment-schedule-section.flex-box-table-row {
    margin-bottom: 15px;
  }
}

.header-item {
  font-weight: bold;
}

/* Responsive Break Points */

@media (max-width: 1200px) {
  .practice-name-header h3 {
    display: none;
  }

  .customer-dashboard-page .tabs_wrapper {
    flex-wrap: wrap;
  }

  .tabs_wrapper ul.tabs {
    padding: 30px;
    width: 100%;
    margin-bottom: 20px;
  }

  .card.card-innerCard {
    margin: 20px 0;
    padding: 0;
  }

  .card.card-innerCard .displayDocs {
    margin-left: 0;
  }

  .dashboardLoanDetailsTitles {
    margin-left: 0;
  }

  .customer-dashboard-page .tab_content {
    padding-left: 0;
    padding-right: 0;
  }
}

@media (max-width: 930px) {
  .customer-dashboard-page {
    width: 710px;
  }
}

@media (max-width: 750px) {
  .customer-dashboard-page {
    width: 390px;
  }
}

#dashboardUserInfo .flex-box-table-row {
  flex-direction: column;
}

.profileInfo .header-item {
  flex: 1 1 100% !important;
}

#dashboardUserInfo {
  padding-right: 0 !important;
}

@media (max-width: 470px) {
  .customer-dashboard-page {
    width: 300px;
    margin-bottom: 60px;
  }
}

.footer-links {
  flex-direction: column;
}

.loanDetailsTableDivs {
  padding: 0 !important;
}

.dashboardUserDocs {
  padding-right: 0;
}

.dashboardLoanDetailsTitles {
  margin: 15px 0 0 0 !important;
}

.displayDocs {
  margin: 0 !important;
  padding-right: 0;
}

/* end responsive break points */
@media (max-width: 600px) {}

@media (max-width: 930px) {
  .container ul.tabs {
    margin-bottom: 15px;
    transition: none;
  }
}
</style>
