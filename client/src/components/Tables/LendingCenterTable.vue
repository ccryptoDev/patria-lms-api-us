
<template>
  <BaseTableSection :navConfig="navConfig" :defaultParams="defaultParams" @fetch-data="fetchTable"
    @navigation="rows = []" :totalRows="totalRows" :useSearch="true" :useNavigation="true" :usePagination="true">
    <!-- <div
      style="display: flex; align-items: center; margin: 8px 0px;"
    >
      <button style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="movetocollections()">
        Move to collections
      </button>
    </div> -->
    <PerformingTemplate v-if="currentStatus === 'in-repayment prime'" title="In-Repayment Applications"
      screenTitle="Lending" :rows="rows" />
    <PerformingTemplate v-if="currentStatus === 'in-repayment non-prime'" title="In-Repayment Non-Prime Applications"
      screenTitle="Lending" :rows="rows" />
    <PerformingTemplate v-if="currentStatus === 'paid'" title="Paid Applications" screenTitle="Lending" :rows="rows" />
    <PerformingTemplate v-if="currentStatus === 'closed'" title="Closed Applications" screenTitle="Lending"
      :rows="rows" />
    <PerformingTemplate v-if="currentStatus === 'all'" title="All applications" screenTitle="Lending" :rows="rows" />
  </BaseTableSection>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "./base/TableSection.vue";
import PerformingTemplate from "./templates/lending-center/PerformingTemplate.vue";
import { adminDashboardRequests } from "../../api/admin-dashboard";
import { TableRequestEvent } from "../../types/tables";
import { moveLoanCollections } from "@/user-application/authentication/api";
const DEFAULT_REQUEST_PARAMS = {
  status: "all",
  page: 1,
  perPage: 25,
};
export default Vue.extend({
  components: {
    BaseTableSection,
    PerformingTemplate,
  },
  name: "LendingCenterTable",
  data() {
    return {
      defaultParams: DEFAULT_REQUEST_PARAMS,
      currentStatus: "",
      totalRows: 0,
      rows: [],
      navConfig: [
        {
          status: "all",
          text: "All",
        },
        {
          status: "in-repayment prime",
          text: "In-Repayment",
        },
        // {
        //   status: "in-repayment non-prime",
        //   text: "In-Repayment",
        // },
        {
          status: "paid",
          text: "Paid",
        },
      ],
    };
  },
  methods: {
    async fetchTable(event: TableRequestEvent) {
      this.currentStatus = event.status as string;
      localStorage.removeItem('collectionData');
      if (event.status === "all") {
        event.status = [
          "in-repayment prime",
          "in-repayment",
          "in-repayment non-prime",
          "paid",
          "in-repayment delinquent1",
          "in-repayment delinquent2",
          "in-repayment delinquent3",
          "in-repayment delinquent4",
        ];
      }

      const { data } = await adminDashboardRequests.getLoans({ ...event });
      const { items: rows, total: totalRows } = data;

      this.rows = rows;
      this.totalRows = totalRows;
    },
    async movetocollections() {
      const arrayLS = localStorage.getItem('collectionData')!
      const myArray = JSON.parse(arrayLS)
      if (myArray && myArray.length > 1) {
        try {
          const titleString = "Do you want to move this loan to collections";
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
                    'Lending'
                  );
                  this.$swal({
                    title: "Alert",
                    text: "Loan moved to collections",
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
