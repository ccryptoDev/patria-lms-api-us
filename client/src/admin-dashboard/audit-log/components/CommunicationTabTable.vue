<template>
  <BaseTableSection
    :defaultParams="defaultParams"
    @fetch-data="fetchTable"
    @navigation="rows = []"
    :totalRows="totalRows"
    :useSearch="true"
    :usePagination="true"
  >
    <CommunicationTabTemplate :rows="rows" />
  </BaseTableSection>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "@/components/Tables/base/TableSection.vue";
import { adminDashboardRequests } from "@/api/admin-dashboard";
import { TableRequestEvent } from "@/types/tables";
import { errorHandler } from "@/api/error-handler";
import CommunicationTabTemplate from "@/admin-dashboard/audit-log/components/CommunicationTabTemplate.vue";

const DEFAULT_REQUEST_PARAMS = { page: 1, perPage: 25 };

export default Vue.extend({
  components: {
    BaseTableSection,
    CommunicationTabTemplate,
  },

  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
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
      try {
        const {
          data,
        } = await adminDashboardRequests.getCommunicationHistoryLogActivity(
          this.screenTrackingId,
          {
            ...event,
          }
        );
        const { rows, totalRows } = data;
        this.rows = rows;
        this.totalRows = totalRows;
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
