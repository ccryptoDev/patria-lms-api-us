<template>
  <Layout>
    <h2 style="font-weight: bold;">Lending Center</h2>
    <LendingCenterTable />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import LendingCenterTable from "../../components/Tables/LendingCenterTable.vue";

export default Vue.extend({
  components: { Layout, LendingCenterTable },
});
</script>
