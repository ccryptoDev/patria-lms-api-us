<template>
  <BaseTable :title="title" :fields="fields" :rows="rows" :onSort="onSort">
    <template #cell(name)="data">
      <router-link :to="`/admin/loan-details/${data.item.screenTrackingId}`">{{
         data.item.name 
        }}</router-link>
    </template>
    <template #cell(status)="data">
      {{  data.item.status | string  }}
    </template>
    <template #cell(createdAt)="data">
      {{  data.item.createdAt | timestamp  }}
    </template>
    <template #cell(userReference)="data">
      {{  data.item.userReference | phone  }}
    </template>
    <template #cell(_id)="data">
      <div style="display:flex" v-if="data.item.status == 'pending'">
        <i v-b-tooltip.hover title="Deny" @click="onAction(data.item._id, 'denied')" style="cursor: pointer; color: red"
          class="material-icons">close</i>
        <i v-b-tooltip.hover title="Approve" @click="onAction(data.item._id, 'approved')"
          style="cursor: pointer; color: green; margin-left: 15px;" class="material-icons">check_circle</i>
      </div>
    </template>
  </BaseTable>
</template>

<script lang="ts">
import { adminDashboardRequests } from "@/api/admin-dashboard";
import Vue from "vue";

import BaseTable from "../../base/Table.vue";

export default Vue.extend({
  name: "ApprovalTable",
  components: { BaseTable },
  data() {
    return {
      fields: [
        { key: "agent.userName", label: "Requested By" },
        { key: "description", label: "Description" },
        { key: "createdAt", label: "Date Created" },
        { key: "email", label: "Email Address" },
        { key: "user.userReference", label: "User Ref Id" },
        { key: "status", label: "Status" },
        { key: "_id", label: "Action" },

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
  methods: {
    async onAction(id: string, action: 'approved' | 'denied') {
      try {
        const payload = {
          approvalId: id,
          status: action
        }
        const response = await adminDashboardRequests.actionOnApprovalRequest(payload)
        await this.$swal({
          title: "Success",
          text: `${response.data.message}`,
          icon: "success",
        });
        this.fetchTable({ perPage: 10, page: 1, status: 'pending' });
      } catch (error) {
        const errMsg = error?.response?.data?.message;
        const errCode = error?.response?.data?.statusCode;
        await this.$swal({
          title: "Error",
          text: `${errMsg}`,
          icon: "error",
        });
        console.log("onAction::", error)
      }
    }
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
    fetchTable: {
      required: false,
      default: null,
      type: Function,
    }
  },
});
</script>
