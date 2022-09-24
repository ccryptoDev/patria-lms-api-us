<template>
  <BaseTable :title="title" :fields="fields" :rows="rows" :onSort="onSort">
    <template #cell(id)="data">
      <router-link :to="`/admin/edit-user/${data.item.id}`" class="button"
        >Edit</router-link
      >
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
  name: "AdminTemplate",
  components: { BaseTable },
  data() {
    return {
      fields: [
        { key: "userName", label: "User Name" },
        { key: "email", label: "Email Address" },
        { key: "phone", label: "Phone Number" },
        { key: "role", label: "Role" },
        { key: "location", label: "Location" },
        { key: "createdDate", label: "Created Date " },
        { key: "id", label: "Action" },
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
