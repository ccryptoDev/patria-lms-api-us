<template>
  <BaseTable :fields="fields" :rows="rows" :onSort="onSort">
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
        { key: "subject", label: "Subject" },
        { key: "comment", label: "Comments" },
        { key: "createdBy", label: "Created By" },
        { key: "dateCreated", label: "Created Date" },
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
