<template>
  <Layout v-if="logReference">
    <div>
      <div>
        <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
          View Log Info
        </h3>
      </div>
      <div class="table-responsive">
        <table class="table table-bordered">
          <tbody>
            <tr>
              <th>Loan Reference</th>
              <td v-if="loanReference">
                {{ loanReference }}
              </td>
              <td v-else>
                --
              </td>
            </tr>
            <tr>
              <th>Log Reference</th>
              <td>
                {{ logReference }}
              </td>
            </tr>
            <tr>
              <th>Module Name</th>
              <td>
                {{ moduleName }}
              </td>
            </tr>
            <tr>
              <th>Requested URL</th>
              <td>
                {{ requestUri }}
              </td>
            </tr>
            <tr>
              <th>Message</th>
              <td>
                {{ message }}
              </td>
            </tr>
            <tr v-if="jsonData">
              <th>Details</th>
              <td>
                <pre>{{ jsonData }}</pre>
              </td>
            </tr>
            <tr>
              <th>Remote Address</th>
              <td>
                {{ ip }}
              </td>
            </tr>
            <tr>
              <th>Logged Date</th>
              <td>
                {{ createdAt | timestamp }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "@/views/layouts/admin/Layout.vue";
import { adminDashboardRequests } from "@/api/admin-dashboard";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  components: {
    Layout,
  },

  data() {
    return {
      createdAt: null as null | string,
      ip: null as null | string,
      jsonData: null as null | string,
      loanReference: null as null | string,
      logReference: null as null | string,
      message: null as null | string,
      moduleName: null as null | string,
      requestUri: null as null | string,
    };
  },

  async created() {
    try {
      const logActivityId = this.$route.params.id;
      const { data } = await adminDashboardRequests.getLogActivityById(
        logActivityId
      );
      const {
        createdAt,
        ip,
        jsonData,
        loanReference,
        logReference,
        message,
        moduleName,
        requestUri,
      } = data;

      this.createdAt = createdAt;
      this.ip = ip;
      this.jsonData = jsonData;
      (this.loanReference = loanReference), (this.logReference = logReference);
      this.message = message;
      this.moduleName = moduleName;
      this.requestUri = requestUri;
    } catch (error) {
      let errorMessage = "";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else {
        errorMessage = error.message;
      }

      showErrorToast(this, "error", errorMessage);
    }
  },
});
</script>

<style scoped>
pre {
  background-color: rgb(245, 245, 245);
  border: 1px solid rgb(204, 204, 204);
  border-radius: 4px;
  padding: 10px;
}
</style>
