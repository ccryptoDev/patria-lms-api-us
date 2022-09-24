<template>
  <BaseTableSection
    :defaultParams="defaultParams"
    @fetch-data="fetchTable"
    @navigation="rows = []"
    :totalRows="totalRows"
    :useSearch="true"
    :useNavigation="true"
    :usePagination="true"
  >
    <UserTemplate title="Manage Borrowers" :rows="rows" />
  </BaseTableSection>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "./base/TableSection.vue";
import UserTemplate from "./templates/manage-users/UserTemplate.vue";
import { adminDashboardRequests } from "../../api/admin-dashboard";
import { TableRequestEvent } from "../../types/tables";

const DEFAULT_REQUEST_PARAMS = { page: 1, perPage: 25 };

export default Vue.extend({
  components: {
    BaseTableSection,
    UserTemplate,
  },
  name: "LendingCenterTable",

  data() {
    return {
      defaultParams: DEFAULT_REQUEST_PARAMS,
      currentStatus: "",
      rows: [],
      totalRows: 0,
    };
  },

  methods: {
    async fetchTable(event: TableRequestEvent) {
      this.currentStatus = event.status as string;
      const { data } = await adminDashboardRequests.getUsers(event);
      const { rows, totalRows } = data;

      this.rows = rows;
      this.totalRows = totalRows;
    },
  },
});
</script>
