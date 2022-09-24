<template>
  <Layout>
    <h2 style="font-weight: bold;">Needs Review</h2>
    <NeedsReviewTable />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import NeedsReviewTable from "../../components/Tables/NeedsReviewTable.vue";

export default Vue.extend({
  components: { Layout, NeedsReviewTable },
});
</script>
