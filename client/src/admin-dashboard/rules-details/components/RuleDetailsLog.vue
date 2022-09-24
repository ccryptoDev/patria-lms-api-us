<template>
  <div class="accordion" role="tablist">
    <b-card no-body v-for="ruleKey in rulesIds" class="mb-1" :key="ruleKey">
      <b-card-header v-if="ruleKey" header-tag="header" class="p-1" role="tab">
        <b-button block v-b-toggle="'accordion-' + ruleKey" variant="light"
          style="background-color:transparent;outline: none;">
          {{ ruleKey }}
        </b-button>
      </b-card-header>
      <b-collapse v-if="ruleKey" :id="`accordion-` + ruleKey" visible accordion="my-accordion" role="tabpanel">
        <b-card-body>
          <!-- <b-card-text>I start opened because <code>visible</code> is <code>true</code></b-card-text>
          <b-card-text>{{ text }}</b-card-text> -->
          <table>
            <tbody>
              <tr class="ruleDetailRow">
                <td class="font-weight-bold">Rule Id</td>
                <td>{{ ruleContext[ruleKey].ruleId }}</td>
              </tr>
              <tr class="ruleDetailRow">
                <td class="font-weight-bold">Rule Name</td>
                <td>{{ ruleContext[ruleKey].ruleName }}</td>
              </tr>
              <tr class="ruleDetailRow">
                <td class="font-weight-bold">Description</td>
                <td>{{ ruleContext[ruleKey].description || 'N/A' }}</td>
              </tr>
              <tr class="ruleDetailRow">
                <td class="font-weight-bold">User Value</td>
                <td>{{ ruleContext[ruleKey].userValue || 'N/A' }}</td>
              </tr>
              <tr class="ruleDetailRow">
                <td class="font-weight-bold">Expected Value</td>
                <td>{{ ruleContext[ruleKey].expectedValue || 'N/A' }}</td>
              </tr>
              <tr class="ruleDetailRow">
                <td class="font-weight-bold">Status</td>
                <td>{{ ruleContext[ruleKey].status }}</td>
              </tr>
              <tr class="ruleDetailRow">
                <td class="font-weight-bold">Passed</td>
                <td>{{ ruleContext[ruleKey].passed }}</td>
              </tr>
            </tbody>
          </table>
        </b-card-body>
      </b-collapse>
    </b-card>
  </div>
</template>
<style scoped>
.ruleDetailRow>td {
  min-width: 200px;
}
</style>
    <!-- <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
      Log Activity Details
    </h3>
    <LogActivityTabTable :screenTrackingId="screenTrackingId" /> -->
<script lang="ts">

import Vue from "vue";
import { errorHandler } from "@/api/error-handler";
import { adminDashboardRequests } from "@/api/admin-dashboard";
// import LogActivityTabTable from "@/admin-dashboard/rules-details/components/LogActivityTabTable.vue";
// import { VueCollapsiblePanelGroup, VueCollapsiblePanel } from '@dafcoe/vue-collapsible-panel';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const collapsiblePanel = require("@dafcoe/vue-collapsible-panel");
// const { VueCollapsiblePanelGroup, VueCollapsiblePanel } = collapsiblePanel;
// import '@dafcoe/vue-collapsible-panel/dist/vue-collapsible-panel.css';

export default Vue.extend({
  data() {
    return {
      text: "Testing",
      items: [
        { label: 'Stephen Hawking', ruleId: 1, },
        { name: 'Johnny Appleseed', id: 2, },
      ],
      fields: [
        { key: 'ruleId', label: 'RuleID' },
        { key: 'ruleName', label: 'Rule Name' },

      ],
      rulesIds: [],
      ruleContext: null
    }
  },
  components: {
    // LogActivityTabTable,
    // VueCollapsiblePanelGroup,
    // VueCollapsiblePanel
  },
  mounted: function mounted() {
    this.fetchTable()
  },
  methods: {
    async fetchTable() {
      try {
        const {
          data,
        } = await adminDashboardRequests.getRulesDetailsByScreenTrackingId(
          this.screenTrackingId
        );
        const { rulesDetails, totalRows } = data;
        const rulesIds: any = Object.keys(rulesDetails.ruleData);
        const ruleContext: any = rulesDetails.ruleData;
        this.rulesIds = rulesIds;
        this.ruleContext = ruleContext;
        // this.totalRows = totalRows;
      } catch (error) {
        const errorMessage = await errorHandler(error, this.$router);
        if (errorMessage) {
          await this.$swal({
            title: "Error",
            text: `${errorMessage}`,
            icon: "error",
          });
        }
      }
    },
  },
  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },
});
</script>

<style scoped>
</style>
