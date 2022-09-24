<template>
  <BaseTableSection
    :defaultParams="defaultParams"
    @fetch-data="fetchTable"
    @navigation="rows = []"
    :totalRows="totalRows"
    :useSearch="true"
    :usePagination="true"
  >
    <template v-slot:action
      ><router-link to="/admin/add-user" class="button"
        >Add Admin</router-link
      ></template
    >
    <AdminTemplate title="Manage Admins" :rows="rows" />
  </BaseTableSection>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "./base/TableSection.vue";
import AdminTemplate from "./templates/manage-users/AdminTemplate.vue";
import { adminDashboardRequests } from "../../api/admin-dashboard";
import { TableRequestEvent } from "../../types/tables";

const DEFAULT_REQUEST_PARAMS = { page: 1, perPage: 25 };
export default Vue.extend({
  components: {
    BaseTableSection,
    AdminTemplate,
  },

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
      const { data } = await adminDashboardRequests.getAdmins({ ...event });
      const { rows, totalRows } = data;
      this.rows = rows;
      this.totalRows = totalRows;
    },
  },
});
</script>
<style scoped>
.button {
  background-color: #ea4c89;
  border-radius: 30px;
  border: 1px solid #ea4c89;
  color: #fff;
  font-weight: bold;
  min-width: 100%;
  padding: 10px;
  text-align: center;
}
.button:hover {
  text-decoration: none;
}
</style>
