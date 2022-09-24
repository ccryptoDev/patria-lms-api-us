<template>
  <Layout>
    <h2 style="font-weight: bold;">Application Manual Review</h2>
    <ManualReviewTable />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import ManualReviewTable from "../../components/Tables/ManualReviewTable.vue";

export default Vue.extend({
  components: { Layout, ManualReviewTable },
});
</script>
