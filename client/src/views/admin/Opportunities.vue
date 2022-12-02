<template>
  <Layout>
    <h2 style="font-weight: bold;">Application status</h2>
    <OpportunitiesTable />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import OpportunitiesTable from "../../components/Tables/OpportunitiesTable.vue";
export default Vue.extend({
  components: { Layout, OpportunitiesTable },
});
</script>
