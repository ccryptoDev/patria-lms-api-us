<template>
  <div>
    <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
      Log Activity Details
    </h3>
    <LogActivityTabTable :screenTrackingId="screenTrackingId" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import LogActivityTabTable from "@/admin-dashboard/audit-log/components/LogActivityTabTable.vue";

export default Vue.extend({
  components: {
    LogActivityTabTable,
  },

  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },
});
</script>

<style scoped></style>
