<template>
  <BaseTable :title="title" :fields="fields" :rows="rows" :onSort="onSort">
    <template #cell(check)="data">
      <div>
        <b-form-row>
          <input type="checkbox" class="isCollection" :id="data.item.screenTrackingId"
            :value="data.item.screenTrackingId"
            v-on:change="onCheckboxInput($event, data.item.email, title, data.item.screenTrackingId, data.item.status)">
          <label for="checkbox" class="collectionLabel">{{ data.item.idKeyName }}</label>
        </b-form-row>
      </div>
    </template>
    <template #cell(name)="data">
      <router-link :to="{
  path: `/admin/loan-details/${data.item.screenTrackingId}`, query: {'status':'MR'}
      }">{{
      data.item.name
      }}</router-link>
    </template>
    <template #cell(status)="data">
      {{ data.item.status | string }}
    </template>
    <template #cell(approvedUpTo)="data">
      {{ data.item.approvedUpTo | currency }}
    </template>
    <template #cell(selectedAmount)="data">
      {{ data.item.selectedAmount | currency }}
    </template>
    <template #cell(phone)="data">
      {{ data.item.phone | phone }}
    </template>
    <template #cell(dateCreated)="data">
      {{ data.item.dateCreated | timestamp }}
    </template>
    <template #cell(assignedTo)="data">
      <label for="assignedTo" class=data> {{ data.item.collectionAdmin }} </label>
    </template>
  </BaseTable>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTable from "../../base/Table.vue";

export default Vue.extend({
  name: "IncompleteTemplate",
  components: { BaseTable },

  data() {
    return {
      collectionData: [{}],
      fields: [
        "name",
        { key: "status", label: "Loan Status" },
        { key: "approvedUpTo", label: "Approved Up To Amount" },
        { key: "selectedAmount", label: "Current Balance" },
        { key: "dateCreated", label: "Date Created" },
        { key: "phone", label: "Phone Number" },
        { key: "email", label: "Email Address" },
        { key: "location", label: "Location" },
        { key: "assignedTo", label: "Assigned To" },
        { key: "check", label: "Assign" },
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
    onCheckboxInput(e: any, checkboxName: string, titleLabel: string, id: string, status: string) {

      if (this.collectionData != null && e.target.checked == false) {
        let index = 0;
        for (const x in this.collectionData) {
          if (index != 0) {
            if (checkboxName === this.collectionData[index]) {
              this.collectionData.splice(index);
            }
          }
          index = index + 1;
        }
        localStorage.setItem('collectionData', JSON.stringify(this.collectionData));

      }
      if (e.target.checked == true) {
        this.collectionData.push(checkboxName);
        localStorage.setItem('collectionData', JSON.stringify(this.collectionData));
      }
      // console.log('PSK LABEL \n\n\n\n' + JSON.stringify(this.collectionData));
      // console.log('PSK LABEL \n\n\n\n' + e.target.checked);


    },
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
