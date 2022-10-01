<template>
  <BaseTableSection :navConfig="navConfig" :defaultParams="defaultParams" v-on:fetch-data="fetchTable"
    v-on:navigation="rows = []" :totalRows="totalRows" :useSearch="true" :useNavigation="true" :usePagination="true">
    <TableTemplate v-if="currentStatus === 'approved'" title="Approved Applications" :rows="rows"
      :fetchTable="fetchTable" />
    <TableTemplate v-if="currentStatus === 'pending'" title="Pending Applications" :rows="rows"
      :fetchTable="fetchTable" />
    <TableTemplate v-if="currentStatus === 'denied'" title="Denied Applications" :rows="rows"
      :fetchTable="fetchTable" />
  </BaseTableSection>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "./base/TableSection.vue";
import IncompleteTemplate from "./templates/opportunities/IncompleteTemplate.vue";
import TableTemplate from "./templates/approvals/tableTemplate.vue";
import DeniedTemplate from "./templates/opportunities/DeniedTemplate.vue";
import { adminDashboardRequests } from "../../api/admin-dashboard";
import { TableRequestEvent } from "../../types/tables";

const DEFAULT_REQUEST_PARAMS = {
  status: "pending",
  page: 1,
  perPage: 25,
};

export default Vue.extend({
  components: {
    BaseTableSection,
    TableTemplate
  },
  name: "ApprovalTable",
  data() {
    return {
      defaultParams: DEFAULT_REQUEST_PARAMS,
      currentStatus: "",
      totalRows: 0,
      rows: [],
      navConfig: [
        {
          status: "approved",
          text: "Approved",
        },
        {
          status: "pending",
          text: "Pending",
        },
        {
          status: "denied",
          text: "Denied",
        },
      ],
    };
  },
  methods: {
    async fetchTable(event: TableRequestEvent) {
      this.currentStatus = event.status as string;
      if (event.status === "all") {
        event.status = ["approved", "pending", "denied"];
      }

      const { data } = await adminDashboardRequests.getApprovalsRequest({ ...event });
      const { items: rows, total: totalRows } = data;
      this.rows = rows;
      this.totalRows = totalRows;
    },
  },
});
</script>
