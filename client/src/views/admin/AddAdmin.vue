<template>
  <Layout>
    <ManageAdmin />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import ManageAdmin from "@/components/details/ManageAdmin.vue";

export default Vue.extend({
  components: {
    Layout,
    ManageAdmin,
  },
});
</script>
