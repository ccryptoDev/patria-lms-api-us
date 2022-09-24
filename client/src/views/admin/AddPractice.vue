<template>
  <Layout>
    <ManagePractice />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import ManagePractice from "@/components/details/ManagePractice.vue";

export default Vue.extend({
  components: {
    Layout,
    ManagePractice,
  },
});
</script>
