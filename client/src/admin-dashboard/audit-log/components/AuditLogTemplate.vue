<template>
  <BaseTable :fields="fields" :rows="rows" :onSort="onSort">
    <template #cell(id)="data">
      <router-link
        :to="`/admin/view-log-details/${data.item.id}`"
        class="button"
        >View</router-link
      >
    </template>

    <template #cell(loanReference)="data">
      <router-link
        v-if="data.item.screenTrackingId && data.item.loanReference !== '--'"
        :to="`/admin/loan-details/${data.item.screenTrackingId}`"
        >{{ data.item.loanReference }}</router-link
      >
      <span v-else>{{ data.item.loanReference }}</span>
    </template>

    <template #cell(dateCreated)="data">
      {{ data.item.dateCreated | timestamp }}
    </template>
  </BaseTable>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTable from "@/components/Tables/base/Table.vue";

export default Vue.extend({
  components: { BaseTable },

  props: {
    rows: {
      required: true,
      default: () => [],
      type: Array,
    },
    onSort: {
      required: false,
      default: null,
      type: Function,
    },
  },

  data() {
    return {
      fields: [
        { key: "loanReference", label: "Loan Reference" },
        { key: "logReference", label: "Log Reference" },
        { key: "email", label: "Email Address" },
        { key: "moduleName", label: "Module Name" },
        { key: "message", label: "Message" },
        { key: "ip", label: "Ip Address" },
        { key: "dateCreated", label: "Created Date" },
        { key: "id", label: "Action" },
      ],
    };
  },
});
</script>

<style scoped>
.button {
  background-color: #ea4c89;
  border-radius: 30px;
  border: 1px solid #ea4c89;
  color: #fff;
  font-weight: bold;
  min-width: 100%;
  padding: 10px;
  text-align: center;
}
.button:hover {
  text-decoration: none;
}
</style>
