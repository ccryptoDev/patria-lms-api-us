<template>
  <Layout>
    <ManagePractice :practiceManagementId="practiceManagementId" />
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
  data() {
    return {
      practiceManagementId: null as null | string,
    };
  },
  created() {
    const practiceManagementId = this.$route.params.id;
    this.practiceManagementId = practiceManagementId;
  },
});
</script>
