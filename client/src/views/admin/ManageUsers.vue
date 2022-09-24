<template>
  <Layout>
    <h2 style="font-weight: bold;">Manage Borrowers</h2>
    <UsersTable />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import UsersTable from "@/components/Tables/UsersTable.vue";
import Layout from "../layouts/admin/Layout.vue";

export default Vue.extend({
  components: { Layout, UsersTable },
});
</script>
