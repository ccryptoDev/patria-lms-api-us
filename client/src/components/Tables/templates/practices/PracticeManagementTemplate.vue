<template>
  <BaseTable :title="title" :fields="fields" :rows="rows" :onSort="onSort">
    <template #cell(_id)="data">
      <router-link
        :to="`/admin/edit-practice-management/${data.item._id}`"
        class="button"
        >Edit</router-link
      >
    </template>
    <template #cell(openDate)="data">
      {{ data.item.openDate | date }}
    </template>
    <template #cell(phone)="data">
      {{ data.item.phone | phone }}
    </template>
  </BaseTable>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTable from "../../base/Table.vue";

export default Vue.extend({
  name: "UserTemplate",
  components: { BaseTable },

  data() {
    return {
      fields: [
        { key: "region", label: "Region" },
        { key: "managementRegion", label: "Management Region" },
        { key: "location", label: "Location" },
        { key: "openDate", label: "Open Date" },
        { key: "address", label: "Address" },
        { key: "city", label: "City" },
        { key: "stateCode", label: "State" },
        { key: "zip", label: "Zip" },
        { key: "phone", label: "Phone" },
        { key: "regionalManager", label: "Regional Manager" },
        { key: "_id", label: "Action" },
      ],
    };
  },

  props: {
    title: {
      required: false,
      default: null,
      type: String,
    },
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
