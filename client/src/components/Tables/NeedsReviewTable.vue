<template>
  <BaseTableSection :navConfig="navConfig" :defaultParams="defaultParams" @fetch-data="fetchTable"
    @navigation="rows = []" :totalRows="totalRows" :useSearch="true" :useNavigation="true" :usePagination="true">
    <div style="display: flex; align-items: center; margin: 8px 0px;">
      <AssignCollections />
      <button style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="assigntoMe()">
        Assign to me
      </button>
      <!-- <button style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="movetocollections()">
        Move out of collections
      </button> -->
    </div>
    <DelinquentTemplate v-if="currentStatus === 'in-repayment delinquent1'" title="1-4 Week Delinquent" :rows="rows" />
    <DelinquentTemplate v-if="currentStatus === 'in-repayment delinquent2'" title="5-8 Week Delinquent" :rows="rows" />
    <DelinquentTemplate v-if="currentStatus === 'in-repayment delinquent3'" title="9-12 Week Delinquent" :rows="rows" />
    <DelinquentTemplate v-if="currentStatus === 'in-repayment delinquent4'" title="12 + Week Delinquent" :rows="rows" />
    <DelinquentTemplate v-if="currentStatus === 'all'" title="All applications" :rows="rows" />
    <DelinquentTemplate v-if="currentStatus === 'my needs'" title="My Delinquent Loans" :rows="rows" />
  </BaseTableSection>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "./base/TableSection.vue";
import DelinquentTemplate from "./templates/lending-center/DelinquentTemplate.vue";
import { adminDashboardRequests } from "../../api/admin-dashboard";
import { TableRequestEvent } from "../../types/tables";
import AssignCollections from "@/components/buttons/AssignCollections.vue";
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
    AssignCollections,
  },
  name: "NeedsReviewTable",
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
      navConfig: [
        {
          status: "all",
          text: "All",
        },
        {
          status: "my needs",
          text: "My Delinquent Loans",
        },
        {
          status: "in-repayment delinquent1",
          text: "1-4 Week Delinquent",
        },
        {
          status: "in-repayment delinquent2",
          text: "5-8 Week Delinquent",
        },
        {
          status: "in-repayment delinquent3",
          text: "8-12 Week Delinquent",
        },
        {
          status: "in-repayment delinquent4",
          text: "12 + Week Delinquent",
        },
      ],
    };
  },
  methods: {
    async fetchTable(event: TableRequestEvent) {
      this.currentStatus = event.status as string;
      if (event.status === "all" || event.status === "my needs") {
        event.status = ["in-repayment delinquent1", "in-repayment delinquent2", "in-repayment delinquent3", "in-repayment delinquent4"];
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
    async movetocollections() {
      const arrayLS = localStorage.getItem('collectionData')!
      const myArray = JSON.parse(arrayLS)
      if (myArray && myArray.length > 1) {
        try {
          const titleString = "Do you want to move this loan out of collections";
          this.$swal
            .fire({
              title: titleString,
              showCancelButton: true,
              icon: "info",
              reverseButtons: false,
              confirmButtonText: `Yes`,
              cancelButtonText: `Cancel`,
            })
            .then(async (result) => {
              if (result.isConfirmed) {
                try {
                  const myArrayFromLocalStorage = localStorage.getItem('collectionData')!
                  const myArray = JSON.parse(myArrayFromLocalStorage)
                  const moveResult = await moveLoanCollections(
                    myArray,
                    'Collections'
                  );
                  this.$router.go(0);
                } catch (error) {
                  this.$swal({
                    title: "Alert",
                    text: "Loan cannot be moved",
                    icon: "info",
                    confirmButtonText: `Ok`,
                  }).then(async (result) => {
                    if (result.isConfirmed) {
                      this.$router.go(0);
                    }
                  });
                }
              } else if (result.isDismissed) {
                //this.$router.go(0)
                return false;
              }
            });
        } catch (error) {
          this.$swal({
            title: "Alert",
            text: "Loan cannot be moved to collections",
            icon: "info",
          });
        }
      }
    },
  },
});
</script>
