<template>
  <BaseTableSection
    :navConfig="navConfig"
    :defaultParams="defaultParams"
    v-on:fetch-data="fetchTable"
    v-on:navigation="rows = []"
    :totalRows="totalRows"
    :useSearch="true"
    :useNavigation="true"
    :usePagination="true"
  >
    <IncompleteTemplate
      v-if="currentStatus === 'all'"
      title="All Applications"
      :rows="rows"
    />
    <IncompleteTemplate
      v-if="currentStatus === 'approved'"
      title="Approved Applications"
      :rows="rows"
    />
    <IncompleteTemplate
      v-if="currentStatus === 'pending'"
      title="Pending Applications"
      :rows="rows"
    />
    <DeniedTemplate
      v-if="currentStatus === 'denied'"
      title="Denied Applications"
      :rows="rows"
    />
    <IncompleteTemplate
      v-if="currentStatus === 'expired'"
      title="Expired Applications"
      :rows="rows"
    />
  </BaseTableSection>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "./base/TableSection.vue";
import IncompleteTemplate from "./templates/opportunities/IncompleteTemplate.vue";
import DeniedTemplate from "./templates/opportunities/DeniedTemplate.vue";
import { adminDashboardRequests } from "../../api/admin-dashboard";
import { TableRequestEvent } from "../../types/tables";

const DEFAULT_REQUEST_PARAMS = {
  status: "all",
  page: 1,
  perPage: 25,
};

export default Vue.extend({
  components: {
    BaseTableSection,
    IncompleteTemplate,
    DeniedTemplate,
  },
  name: "OpportunitiesTable",
  data() {
    return {
      defaultParams: DEFAULT_REQUEST_PARAMS,
      currentStatus: "",
      totalRows: 0,
      rows: [],
      navConfig: [
        {
          status: "all",
          text: "All",
        },
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
        {
          status: "expired",
          text: "Expired",
        },
      ],
    };
  },
  methods: {
    async fetchTable(event: TableRequestEvent) {
      this.currentStatus = event.status as string;
      if (event.status === "all") {
        event.status = ["approved", "pending", "denied", "expired"];
      }

      const { data } = await adminDashboardRequests.getLoans({ ...event });
      const { items: rows, total: totalRows } = data;

      this.rows = rows;
      this.totalRows = totalRows;
    },
  },
});
</script>
