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
    :title="'Approved Applications'"
  >
    <ApprovedTemplate title="Approved Applications" :rows="rows" />
  </BaseTableSection>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "./base/TableSection.vue";
import ApprovedTemplate from "./templates/dashboard/ApprovedTemplate.vue";
import { adminDashboardRequests } from "../../api/admin-dashboard";
import { TableRequestEvent } from "../../types/tables";

const DEFAULT_REQUEST_PARAMS = { status: "approved", page: 1, perPage: 25 };
export default Vue.extend({
  components: {
    BaseTableSection,
    ApprovedTemplate,
  },
  name: "DashboardTable",
  data() {
    return {
      defaultParams: DEFAULT_REQUEST_PARAMS,
      currentStatus: "",
      navConfig: [],
      totalRows: 0,
      rows: [],
    };
  },
  methods: {
    async fetchTable(event: TableRequestEvent) {
      this.currentStatus = event.status as string;
      const { data } = await adminDashboardRequests.getLoans({ ...event });
      const { items: rows, total: totalRows } = data;

      this.rows = rows;
      this.totalRows = totalRows;
    },
  },
});
</script>
