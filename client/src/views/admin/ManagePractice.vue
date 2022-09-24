<template>
  <Layout>
    <h2 style="font-weight: bold;">Manage Practices</h2>
    <PracticeManagementTable
  /></Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import PracticeManagementTable from "@/components/Tables/PracticeManagementTable.vue";

export default Vue.extend({
  components: { Layout, PracticeManagementTable },
});
</script>
