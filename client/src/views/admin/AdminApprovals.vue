<template>
  <Layout>
    <h2 style="font-weight: bold;">Admin Approvals</h2>
    <ApprovalsTable />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import ApprovalsTable from "../../components/Tables/ApprovalsTable.vue";
export default Vue.extend({
  components: { Layout, ApprovalsTable },
});
</script>
