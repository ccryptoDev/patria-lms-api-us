<template>
  <Layout>
    <h2 style="font-weight: bold;">Loan Details</h2>
    <card>
      <div v-if="paymentStatus === 'manual-review'" style="display: flex; align-items: center; margin: 8px 0px;">
        <AssignCollections />
        <button style="margin-left: auto; background-color: teal; color: white;"
          @click="changeApplicationStatus('approved')">
          Approve
        </button>
        <button style="margin-left: 10px; background-color: red; color: white;"
          @click="changeApplicationStatus('denied')">
          Denied
        </button>
        <!-- <button style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="movetocollections()">
        Move out of collections
      </button> -->
      </div>
      <b-tabs>
        <b-tab title="User Info" lazy>
          <UserInfo :screenTrackingId="screenTrackingId" />
        </b-tab>
        <b-tab title="Document Center" lazy>
          <DocumentCenter :screenTrackingId="screenTrackingId" />
        </b-tab>
        <b-tab v-if="userData.role === adminRoles.SuperAdmin" title="Credit Reports" lazy>
          <CreditReport :screenTrackingId="screenTrackingId" />
        </b-tab>
        <b-tab title="Payment Schedule" lazy>
          <PaymentSchedule :screenTrackingId="screenTrackingId" />
        </b-tab>
        <b-tab v-if="
          this.paymentManagement.collectionAssignStatus &&
          this.paymentManagement.collectionAssignStatus != ''
        " title="Collections" lazy>
          <CollectionsInfo :screenTrackingId="screenTrackingId" />
        </b-tab>
        <b-tab title="Accounts" lazy>
          <Accounts :screenTrackingId="screenTrackingId" />
        </b-tab>
        <b-tab title="Comments" lazy>
          <CommentsTab :screenTrackingId="screenTrackingId" />
        </b-tab>
        <b-tab v-if="userData.role === adminRoles.SuperAdmin" title="Log" lazy>
          <Log :screenTrackingId="screenTrackingId" />
        </b-tab>
        <b-tab v-if="userData.role === adminRoles.SuperAdmin" title="Rules Details " lazy>
          <RulesDetails :screenTrackingId="screenTrackingId" />
        </b-tab>
        <b-tab v-if="userData.role === adminRoles.SuperAdmin" title="Communication History" lazy>
          <CommunicationActivityTab :screenTrackingId="screenTrackingId" />
        </b-tab>
      </b-tabs>
    </card>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import Card from "@/components/primitives/Card.vue";
import UserInfo from "@/components/details/UserInfo.vue";
import DocumentCenter from "@/components/details/DocumentCenter.vue";
import CreditReport from "@/components/details/TransunionCreditReport.vue";
import Accounts from "@/components/details/Accounts.vue";
import CollectionsInfo from "@/components/details/CollectionsInfo.vue";
import CommentsTab from "@/admin-dashboard/loan-details/comments/components/CommentsTab.vue";
import PaymentSchedule from "@/components/details/PaymentSchedule.vue";
import Log from "@/admin-dashboard/audit-log/components/LogActivityTab.vue";
import RulesDetails from "@/admin-dashboard/rules-details/components/RuleDetailsLog.vue";
import { getUserData } from "@/admin-dashboard/authentication/helpers";
import { getAdminRoles } from "@/admin-dashboard/helpers";
import { adminDashboardRequests } from "@/api/admin-dashboard";
import CommunicationActivityTab from "@/admin-dashboard/audit-log/components/CommunicationActivityTab.vue";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  components: {
    Layout,
    Card,
    UserInfo,
    DocumentCenter,
    Accounts,
    CreditReport,
    PaymentSchedule,
    CollectionsInfo,
    CommentsTab,
    Log,
    RulesDetails,
    CommunicationActivityTab,
  },

  data() {
    return {
      adminRoles: getAdminRoles(),
      userData: getUserData(),
      screenTrackingId: this.$route.params.screenTrackingId,
      paymentManagement: [] as any,
      isManualReview: false,
      paymentStatus: null,
    };
  },
  methods: {
    async changeApplicationStatus(status: string) {
      try {
        const payload = {
          screentrackingId: this.screenTrackingId,
          status
        }
        const response = await adminDashboardRequests.updateManualReviewed(payload);
        if (response?.data?.error) {
          throw new Error(response?.data?.message);
        }
        showErrorToast(this, "success", response?.data?.message);
        this.$router.back()
      } catch (error) {
        showErrorToast(this, "error", error?.message);
      }
    }
  },

  async mounted() {
    const { data } = await adminDashboardRequests.getPaymentManagement(
      this.$route.params.screenTrackingId
    );
    this.paymentManagement = data.response;
    this.paymentStatus = data.response.status;
    const { status } = this.$route?.query;
    if (status === 'MR') {
      this.isManualReview = true;
    }
  },
});
</script>
