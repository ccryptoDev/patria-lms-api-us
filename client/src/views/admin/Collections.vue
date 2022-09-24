<template>
  <Layout>
    <h2 style="font-weight: bold;">Collections</h2>
    <CollectionTable />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import CollectionTable from "../../components/Tables/CollectionTable.vue";

export default Vue.extend({
  components: { Layout, CollectionTable },
});
</script>
