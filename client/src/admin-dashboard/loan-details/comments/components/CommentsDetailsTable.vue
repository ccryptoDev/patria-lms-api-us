<template>
  <div v-if="totalRows > 0">
    <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
      Comments Details
    </h3>
    <BaseTableSection
      :defaultParams="defaultParams"
      @fetch-data="fetchTable"
      @navigation="rows = []"
      :totalRows="totalRows"
      :useSearch="true"
      :usePagination="true"
    >
      <CommentsTemplate :rows="rows" />
    </BaseTableSection>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "@/components/Tables/base/TableSection.vue";
import CommentsTemplate from "@/admin-dashboard/loan-details/comments/components/CommentsDetailsTemplate.vue";
import { adminDashboardRequests } from "@/api/admin-dashboard";
import { TableRequestEvent } from "@/types/tables";
import { errorHandler } from "@/api/error-handler";

const DEFAULT_REQUEST_PARAMS = { page: 1, perPage: 25 };

export default Vue.extend({
  components: {
    BaseTableSection,
    CommentsTemplate,
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
        } = await adminDashboardRequests.getAllCommentsByScreenTrackingId(
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
  async created() {
    await this.fetchTable({ status: "", page: 1, perPage: 25 });
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
