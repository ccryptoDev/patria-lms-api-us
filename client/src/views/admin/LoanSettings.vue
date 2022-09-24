<template>
  <Layout>
    <h2 style="font-weight: bold;">Loan Settings</h2>
    <EditLoanSettings/>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import EditLoanSettings from "./EditLoanSettings.vue";

export default Vue.extend({
  components: { Layout, EditLoanSettings },
});
</script>
