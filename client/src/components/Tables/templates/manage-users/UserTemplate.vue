<template>
  <BaseTable :title="title" :fields="fields" :rows="rows" :onSort="onSort">
    <template #cell(userReference)="data">
      <router-link :to="`/admin/loan-details/${data.item.screenTrackingId}`">{{
        data.item.userReference
      }}</router-link>
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
        { key: "userReference", label: "User Reference" },
        "name",
        { key: "email", label: "Email Address" },
        { key: "phone", label: "Phone Number" },
        { key: "registerStatus", label: "Registration Status" },
        { key: "practiceName", label: "Location" },
        { key: "createdDate", label: "Created Date " },
      ],
    };
  },
  methods: {},
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
