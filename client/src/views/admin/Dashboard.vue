<template>
  <Layout>
    <h2 style="font-weight: bold;">Dashboard</h2>
    <div class="flex flex-wrap justify-content-between mb-4">
      <Counter
        class="flex-grow counter-margin"
        v-for="([status, count], index) in countByStatus"
        :key="index"
        :count="count"
        :status="nameForStatus[status]"
        :link="linkForStatus[status]"
      />
    </div>
    <DashboardTable />
  </Layout>
</template>
<script lang="ts">
import Vue from "vue";

import Layout from "@/views/layouts/admin/Layout.vue";
import Counter from "@/components/Counter.vue";
import DashboardTable from "@/components/Tables/DashboardTable.vue";
import { adminDashboardRequests } from "@/api/admin-dashboard";
import { errorHandler } from "@/api/error-handler";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  components: { Layout, DashboardTable, Counter },

  data() {
    return {
      countByStatus: [] as [string, unknown][],
      nameForStatus: {
        opportunities: "Opportunities - Approved, Pending",
        denied: "Denied Applications",
        expired: "Expired Applications",
        delinquent: "Delinquent Accounts",
        inRepayment: "Loan In Repayment",
      },
      linkForStatus: {
        opportunities: "/admin/opportunities",
        denied: "/admin/opportunities",
        expired: "/admin/opportunities",
        delinquent: "/admin/needs-review",
        inRepayment: "/admin/lending-center",
      },
    };
  },

  async mounted() {
    try {
      const { data } = await adminDashboardRequests.getTotalRowsByStatus();
      const totalsObj = data;

      this.countByStatus = Object.entries(totalsObj).filter(([status]) =>
        ["opportunities", "denied", "expired", "delinquent", "inRepayment"].includes(status)
      );
    } catch (error) {
      const errorMessage = await errorHandler(error, this.$router);
      if (errorMessage) {
        showErrorToast(this, "error", errorMessage);
      }
    }
  },
});
</script>

<style scoped>
.counter-margin {
  margin-left: 10px;
}
.counter-margin:first-child {
  margin-left: 0;
}
</style>
