<template>
  <Layout>
    <h2 style="font-weight: bold;">Manage Admin Users</h2>
    <AdminsTable />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import AdminsTable from "@/components/Tables/AdminsTable.vue";

export default Vue.extend({
  components: { Layout, AdminsTable },
});
</script>
