<template>
  <Layout>
    <h2 style="font-weight: bold;">Manage Log Activity</h2>
    <AuditLogTable
  /></Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "@/views/layouts/admin/Layout.vue";
import AuditLogTable from "@/admin-dashboard/audit-log/components/AuditLogTable.vue";

export default Vue.extend({
  components: { Layout, AuditLogTable },
});
</script>
