<template>
  <BaseTable :title="title" :fields="fields" :rows="rows" :onSort="onSort">
    <template #cell(name)="data">
      <router-link :to="`/admin/loan-details/${data.item.screenTrackingId}`">{{
        data.item.name
      }}</router-link>
    </template>
    <template #cell(phone)="data">
      {{ data.item.phone | phone }}
    </template>
    <template #cell(dateCreated)="data">
      {{ data.item.dateCreated | timestamp }}
    </template>
  </BaseTable>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTable from "../../base/Table.vue";

export default Vue.extend({
  name: "DeniedTemplate",
  components: { BaseTable },
  data() {
    return {
      fields: [
        "name",
        { key: "dateCreated", label: "Date Created" },
        { key: "phone", label: "Phone Number" },
        { key: "email", label: "Email Address" },
        { key: "location", label: "Location" },
        { key: "progress", label: "Progress" },
      ],
    };
  },
  watch: {
    rows(val) {
      if (val.length) {
        this.$store.commit("loanTableEntries/setEntries", {
          idKeyName: "screenTrackingId",
          entries: this.rows,
        });
      }
    },
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
