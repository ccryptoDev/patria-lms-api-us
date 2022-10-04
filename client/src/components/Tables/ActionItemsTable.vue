<template>
  <BaseTableSection
    :navConfig="navConfig"
    :defaultParams="defaultParams"
    @fetch-data="fetchTable"
    @navigation="rows = []"
    :totalRows="totalRows"
    :useSearch="true"
    :useNavigation="true"
    :usePagination="true"
  >
   <div
      style="display: flex; align-items: center; margin: 8px 0px;"
    >
      <!-- <AssignCollections/>
      <button style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="assigntoMe()">
        Assign to me
      </button> -->
      <!--<button style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="movetocollections()">
        Move out of collections
      </button> -->
     </div>
    <ActionTemplate
      v-if="currentStatus === 'in-repayment delinquent1'"
      title="1-4 Week Delinquent"
      :rows="rows"
    />
    <ActionTemplate
      v-if="currentStatus === 'in-repayment delinquent2'"
      title="5-8 Week Delinquent"
      :rows="rows"
    />
    <ActionTemplate
      v-if="currentStatus === 'in-repayment delinquent3'"
      title="9-12 Week Delinquent"
      :rows="rows"
    />
    <ActionTemplate
      v-if="currentStatus === 'in-repayment delinquent4'"
      title="12 + Week Delinquent"
      :rows="rows"
    />
    <ActionTemplate
      v-if="currentStatus === 'all'"
      title="All applications"
      :rows="rows"
    />
  </BaseTableSection>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "./base/TableSection.vue";
import ActionTemplate from "./templates/lending-center/ActionTemplate.vue";
import { adminDashboardRequests } from "../../api/admin-dashboard";
import { TableRequestEvent } from "../../types/tables";
//import AssignCollections from "@/components/buttons/AssignCollections.vue";
import { assignLoantome } from "@/user-application/authentication/api";
import { moveLoanCollections } from "@/user-application/authentication/api";
import moment from "moment";

const DEFAULT_REQUEST_PARAMS = {
  status: "all",
  page: 1,
  perPage: 25,
};
export default Vue.extend({
  components: {
    BaseTableSection,
    ActionTemplate,
    // AssignCollections,
  },
  name: "ActionItemsTable",
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
          status: "in-repayment delinquent1",
          delinquentDays: 1,
          text: "Day 1",
        },
        {
          status: "in-repayment delinquent2",
          delinquentDays: 31,
          text: "Day 31",
        },
        {
          status: "in-repayment delinquent3",
          delinquentDays: 61,
          text: "Day 61",
        },
        {
          status: "in-repayment delinquent4",
          delinquentDays: 91,
          text: "Day 91",
        },
      ],
    };
  },
 
  methods: {
    async fetchTable(event: TableRequestEvent) {
      this.currentStatus = event.status as string;
      if (event.status === "all") {
        event.status = ["in-repayment delinquent1", "in-repayment delinquent2", "in-repayment delinquent3", "in-repayment delinquent4"];
      }
      localStorage.removeItem('collectionData');
      const { data } = await adminDashboardRequests.getLoans({ ...event });
      
      const { items: rows, total: totalRows } = data;
      
      const rows1 : any = [];
      const today: Date = moment().startOf('day').toDate();
      
      if(this.currentStatus === "all"){
         for(let i = 0;i < rows.length; i++){
          const reminderDate: Date = moment(rows[i]["collectionPromiseDate"], 'YYYY-MM-DD').toDate();
          if(rows[i]["delinquencyDays"] == 1 || rows[i]["delinquencyDays"] == 31 ||
          rows[i]["delinquencyDays"] == 61 || rows[i]["delinquencyDays"] == 91 || moment(today).diff(reminderDate, 'day') == 0){
            rows1.push(rows[i]);
          }
        }
      } if(this.currentStatus === "in-repayment delinquent1"){
        
        for(let i = 0;i < rows.length; i++){
          if(rows[i]["delinquencyDays"] == 1){
            rows1.push(rows[i]);
          }
        }
      }
       if(this.currentStatus === "in-repayment delinquent2"){
        for(let i = 0;i < rows.length; i++){
          if(rows[i]["delinquencyDays"] == 31){
            rows1.push(rows[i]);
          }
        }
      }
       if(this.currentStatus === "in-repayment delinquent3"){
        for(let i = 0;i < rows.length; i++){
          if(rows[i]["delinquencyDays"] == 61){
            rows1.push(rows[i]);
          }
        }
      }
       if(this.currentStatus === "in-repayment delinquent4"){
       for(let i = 0;i < rows.length; i++){
          if(rows[i]["delinquencyDays"] == 91){
            rows1.push(rows[i]);
          }
        }
      }
      this.rows = rows1;
      this.totalRows = rows1.length;
    },
    async assigntoMe(){
    const arrayLS = localStorage.getItem('collectionData')!
    const myArray = JSON.parse(arrayLS)
    const admin = localStorage.getItem('adminToken')!
    if (myArray && myArray.length > 1) {
    const myArray = JSON.parse(arrayLS)
    const adminRole = JSON.parse(admin);
      try{
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
    }catch(error){
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
