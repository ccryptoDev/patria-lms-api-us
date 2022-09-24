<template>
    <div id="review-application">
        <div class="container">
            <div class="summary-row large-padding">
                <div class="summary-section">
                    <div class="summary-row large-padding">
                        <div class="summary-title">Applicant Information</div>
                        <div class="summary-action"></div>
                    </div>
                    <div class="summary-row large-padding">
                        <div class="summary-key width-40">Name</div>
                        <div class="summary-value">{{ firstName }} {{ lastName }}</div>
                    </div>
                    <div class="summary-row large-padding">
                        <div class="summary-key width-40">Address</div>
                        <div class="summary-value">
                        {{ address }} {{ city }} {{ state }}
                        {{ zip }}
                        </div>
                    </div>
                    <div class="summary-row large-padding">
                        <div class="summary-key width-40">Social Sec Number</div>
                        <div class="summary-value">
                        {{ ssn && ssn.slice(0, 3) }}-{{ ssn && ssn.slice(3, 5) }}-{{ ssn && ssn.slice(5)}}
                        </div>
                    </div>
                    <div class="summary-row large-padding">
                        <div class="summary-key width-40">Phone</div>
                        <div class="summary-value">{{ (phones && phones.length > 0 && phones[0].phone) | phone }}</div>
                    </div>
                    <div class="summary-row large-padding">
                        <div class="summary-key width-40">Email</div>
                        <div class="summary-value">{{ email }}</div>
                    </div>
                    <div class="summary-row large-padding">
                        <div class="summary-key width-40">Language</div>
                        <div class="summary-value">English</div>
                    </div>
                    <div class="summary-row large-padding">
                        <div class="summary-key width-40">Gross Annual Income</div>
                        <div class="summary-value">{{ annualIncome | currency }}</div>
                    </div>
                    <div class="summary-row large-padding">
                      <b-form-checkbox 
                        @change="turnOnAutopay"
                        v-model="autopayCheck" 
                        name="autopay-switch" 
                        switch 
                        size="lg"
                        :disabled="autopayStatus"
                       >
                        <span v-if="autopayStatus" style="color:#ea4c89;">
                          AutoPay is turned on
                          <p style="font-size:10px;">
                            If you'd like to turn off auto pay, please contact us at support@patria.com
                          </p>
                        </span>
                        <span v-else style="color:#ea4c89;">
                          You are not setup for AutoPay
                          <p>Make sure your payment is on time each month by
                          enabling AutoPay today!
                          </p>
                        </span>
                      </b-form-checkbox>
                    </div>
                </div>
                
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from "vue";
import { errorHandler } from "@/api/error-handler";

import { enableAutopay } from "@/user-application/dashboard/api";

export default Vue.extend({
    components: {
    },
    props: ['UserInfoData', 'DashboardData', 'tabIndex'],
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
                passportPath,
                paymentManagementData,
                ricPath,
                eftaPath,
                smsPolicyPath,
                userAccountsData,
            } = this.DashboardData;
            this.driversLicensePaths = driversLicensePaths;
            this.esignaturePath = esignaturePath;
            this.passportPath = passportPath;
            this.paymentManagementData = paymentManagementData;
            this.autopayStatus = paymentManagementData.canRunAutomaticPayment;
            this.autopayCheck = this.autopayStatus;
            this.ricPath = ricPath;
            this.eftaPath = eftaPath;
            this.smsPolicyPath = smsPolicyPath;
            this.cards = userAccountsData;

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
            cards: [],
            address: null as null | string,
            annualIncome: null as null | number,
            approvedUpTo: null as null | number,
            city: null as null | string,
            driversLicensePaths: null as null | Record<string, unknown>,
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
            autopayStatus: false,
            autopayCheck: false,
        };
    },

    computed: {
    },

    methods: {
      async turnOnAutopay() {
        try {
          if(this.cards.length > 0) {
            if(this.paymentManagementData) {
              const requestData = {paymentManagementId: this.paymentManagementData._id};
              await enableAutopay(requestData);
              this.autopayStatus = true;
              await this.$swal({
                title: "Success!",
                text: "AutoPay is enabled!",
                icon: "success",
              });
              this.$emit("reloadPage");
            }
          } else {
            this.$emit('updateTabIndex', 3);
            await this.$swal({
              title: "Alert",
              text: "Please add a payment method first",
              icon: "info",
            });
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
      }
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
tr > :first-child {
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

.displayDocs .doc-item > div:last-child {
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

.isa-contract-section
  .flex-box-table-col.flex-box-item:last-child
  .flex-box-item,
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
@media (max-width: 600px) {
}

@media (max-width: 930px) {
  .container ul.tabs {
    margin-bottom: 15px;
    transition: none;
  }
}
</style>
