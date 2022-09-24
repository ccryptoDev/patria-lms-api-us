<template>
  <BaseTableSection :defaultParams="defaultParams" @fetch-data="fetchTable" @navigation="rows = []"
    :totalRows="totalRows" :useSearch="true" :useNavigation="true" :usePagination="true">
    <!-- <div style="display: flex; align-items: center; margin: 8px 0px;">
      <AssignCollections />
      <button style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="assigntoMe()">
        Assign to me
      </button>
      <button style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="movetocollections()">
        Move out of collections
      </button>
    </div> -->
    <DelinquentTemplate v-if="currentStatus === 'all'" title="All applications" :rows="rows" />
  </BaseTableSection>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "./base/TableSection.vue";
import DelinquentTemplate from "./templates/lending-center/DelinquentTemplate.vue";
import { adminDashboardRequests } from "../../api/admin-dashboard";
import { TableRequestEvent } from "../../types/tables";
// import AssignCollections from "@/components/buttons/AssignCollections.vue";
import { assignLoantome } from "@/user-application/authentication/api";
import { moveLoanCollections } from "@/user-application/authentication/api";

const DEFAULT_REQUEST_PARAMS = {
  status: "all",
  page: 1,
  perPage: 25,
};
export default Vue.extend({
  components: {
    BaseTableSection,
    DelinquentTemplate,
    // AssignCollections,
  },
  name: "ManualReviewTable",
  data() {
    return {
      defaultParams: DEFAULT_REQUEST_PARAMS,
      currentStatus: "",
      totalRows: 0,
      rows: [],
      adminUsers: [] as {
        email: string;
        role: string;
        id: string;
      }[],
    };
  },
  methods: {
    async fetchTable(event: TableRequestEvent) {
      this.currentStatus = event.status as string;
      if (event.status === "all" || event.status === "my needs") {
        event.status = ["manual-review"];
      }
      localStorage.removeItem('collectionData');
      const { data } = await adminDashboardRequests.getLoans({ ...event });
      const { items: rows, total: totalRows } = data;
      const rows1: any = [];
      if (this.currentStatus === "my needs") {
        const { email } = JSON.parse(localStorage.getItem("adminToken")!);
        const { data } = await adminDashboardRequests.getAdmin();
        let adminV: any = [];
        adminV = data.rows;
        for (let i = 0; i < rows.length; i++) {
          this.adminUsers = data.rows.filter(
            (admin: any) => admin.id == rows[i]["collectionAssignedUser"]
          );
          if (this.adminUsers.length > 0) {
            if (this.adminUsers[0].email === email) {
              rows1.push(rows[i]);
            }
          }
        }
      } else {
        for (let i = 0; i < rows.length; i++) {
          rows1.push(rows[i]);
        }
      }
      this.rows = rows1;
      this.totalRows = rows1.length;
    },

    // async fetchManualReviewList() {

    // },
    async assigntoMe() {
      const arrayLS = localStorage.getItem('collectionData')!
      const myArray = JSON.parse(arrayLS)
      const admin = localStorage.getItem('adminToken')!
      if (myArray && myArray.length > 1) {
        const myArray = JSON.parse(arrayLS)
        const adminRole = JSON.parse(admin);
        try {
          const assignResult = await assignLoantome(myArray, `${adminRole.id}`);
          this.$swal({
            title: "Alert",
            text: "Loan assigned successfully",
            icon: "info",
            confirmButtonText: `Ok`,
          }).then(async (result) => {
            if (result.isConfirmed) {
              this.$router.go(0);
            }
          });
        } catch (error) {
          this.$swal({
            title: "Alert",
            text: `${error}`,
            icon: "info",
          });
        }
      }
    },
  },
});
</script>
