<template>
  <Layout>
    <h2 style="font-weight: bold;">Action Items</h2>
    <ActionItemsTable />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import ActionItemsTable from "../../components/Tables/ActionItemsTable.vue";

export default Vue.extend({
  components: { Layout, ActionItemsTable },
});
</script>
