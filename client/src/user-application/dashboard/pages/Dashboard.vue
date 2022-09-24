<template>
  <Layout v-if="firstName && paymentManagementData" :login="true">
    <div id="review-application">
      <div class="container">
        <div class="row justify-content-center" style="margin-bottom: 36px">
          <div class="col-md-6 col-sm-12">
            <div class="page-main-title">Your customer portal</div>
            <div class="">
              <button
                v-if="
                  paymentManagementData.status !== 'in-repayment non-prime' &&
                    paymentManagementData.status !== 'in-repayment prime' &&
                    paymentManagementData.status !== 'in-repayment'
                "
                @click="onContinueApplication"
                style="margin-left: 150px "
              >
                Continue Application
              </button>
            </div>
          </div>
        </div>
        <Card>
          <b-tabs v-model="tabIndex">
            <b-tab title="User Info" lazy href="#userInfo">
              <UserInfo
                @updateTabIndex="updateTabIndex"
                :UserInfoData="applicationDataResponse"
                :DashboardData="dashboardDataResponse"
              />
            </b-tab>
            <b-tab title="Loan Info" lazy>
              <LoanInfo
                :UserInfoData="applicationDataResponse"
                :DashboardData="dashboardDataResponse"
              />
            </b-tab>
            <b-tab title="Payments" lazy>
              <Payment :screenTrackingId="screenTrackingId" />
            </b-tab>
            <b-tab title="Cards" lazy>
              <Accounts
                :screenTrackingId="screenTrackingId"
                :addCardFlag="addCardFlag"
              />
            </b-tab>
            <b-tab title="Document Center" lazy>
              <DocumentCenter
                :UserInfoData="applicationDataResponse"
                :DashboardData="dashboardDataResponse"
                :DocumentData="documentsDataResponse"
              />
            </b-tab>
          </b-tabs>
        </Card>

        <hr />
        <br />
        <br />
      </div>
    </div>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "@/user-application/layout/pages/Layout.vue";
import UserInfo from "./UserInfo.vue";
import LoanInfo from "./LoanInfo.vue";
import Payment from "./PaymentSchedule.vue";
import Accounts from "./Accounts.vue";
import DocumentCenter from "./DocumentCenter.vue";
import Card from "@/components/primitives/Card.vue";
import { getApplicationData } from "@/user-application/application/api";
import { getDashboardData } from "@/user-application/dashboard/api";
import showErrorToast from "@/helpers/errorToast";
import { adminDashboardRequests } from "@/api/admin-dashboard";

export default Vue.extend({
  components: {
    Layout,
    Card,
    UserInfo,
    LoanInfo,
    Payment,
    Accounts,
    DocumentCenter,
  },

  data() {
    return {
      tabIndex: 0,
      addCardFlag: false,
      screenTrackingId: null as null | string,
      firstName: null as null | string,
      paymentManagementData: null as null | Record<string, any>,
      applicationDataResponse: null as null | [],
      dashboardDataResponse: null as null | [],
      documentsDataResponse: null as null | [],
      isScreenCompleted: false,
    };
  },

  methods: {
    updateTabIndex(index: number) {
      this.addCardFlag = true;
      this.tabIndex = index;
    },
    onContinueApplication() {
      // const token = localStorage.getItem("userToken");
      // const url = `${process.env.REACT_APP_BASE_URL}/application/login/magic?userToken=${token}`;
      const userToken = String(localStorage.getItem("userToken"));
      const { token: JWT } = JSON.parse(userToken);
      const url = `${process.env.VUE_APP_LOS_URL}/login/magic?userToken=${JWT}`;
      window.open(url, "_blank");
    },
  },

  async created() {
    try {
      const [
        applicationDataResponse,
        dashboardDataResponse,
      ] = await Promise.all([getApplicationData(), getDashboardData()]);

      this.applicationDataResponse = applicationDataResponse.data;
      this.dashboardDataResponse = dashboardDataResponse.data;
      const { firstName, screenTrackingId } = applicationDataResponse.data;
      this.firstName = firstName;
      this.screenTrackingId = screenTrackingId;

      const { paymentManagementData } = dashboardDataResponse.data;
      this.paymentManagementData = paymentManagementData;
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
