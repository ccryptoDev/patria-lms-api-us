<template>
  <Apply :practiceManagementId="practiceManagementId" />
</template>

<script lang="ts">
import Vue from "vue";

import Apply from "./Apply.vue";
import { getApplicationLinkData } from "@/user-application/application/api";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  components: {
    Apply,
  },

  data() {
    return {
      practiceManagementId: null as null | string,
    };
  },
  async created() {
    const applicationLinkId = this.$route.params.applicationLinkId;

    try {
      const { data, status } = await getApplicationLinkData(applicationLinkId);
      this.practiceManagementId = data.practiceManagement;
    } catch (error) {
      showErrorToast(this, "error", error.message);
    }
  },
});
</script>
