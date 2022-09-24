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
      <AssignCollections/>
      <button style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="assigntoMe()">
        Assign to me
      </button>
      <!-- <button style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="movetocollections()">
        Move out of collections
      </button> -->
    </div>
    
    <PerformingTemplate
      v-if="currentStatus === 'in-repayment prime'"
      title="In-Repayment Collections"
      screenTitle="Collections"
      :rows="rows"
    />
    <PromisingTemplate
      v-if="currentStatus === 'Promise To Pay'"
      title="Promise To Pay Collections"
      screenTitle="Collections"
      :rows="rows"
    />
    <PerformingTemplate
      v-if="currentStatus === 'My Collections'"
      title="My Collections"
      screenTitle="Collections"
      :rows="rows"
    />
    <PerformingTemplate
      v-if="currentStatus === 'Unassigned'"
      title="Unassigned Collections"
      screenTitle="Collections"
      :rows="rows"
    />
    <PerformingTemplate
      v-if="currentStatus === 'all'"
      title="All Collections"
      screenTitle="Collections"
      :rows="rows"
    />
  </BaseTableSection>
  
</template>

<script lang="ts">
import Vue from "vue";

import BaseTableSection from "./base/TableSection.vue";
import PerformingTemplate from "./templates/lending-center/PerformingTemplate.vue";
import PromisingTemplate from "./templates/lending-center/PromisingTemplate.vue";
import { adminDashboardRequests } from "../../api/admin-dashboard";
import { TableRequestEvent } from "../../types/tables";
import AssignCollections from "@/components/buttons/AssignCollections.vue";
import { assignLoantome } from "@/user-application/authentication/api";
import { moveLoanCollections } from "@/user-application/authentication/api";
import AuditLogTemplateVue from "@/admin-dashboard/audit-log/components/AuditLogTemplate.vue";


const DEFAULT_REQUEST_PARAMS = {
  status: "all",
  page: 1,
  perPage: 25,
};
export default Vue.extend({
  components: {
    BaseTableSection,
    PerformingTemplate,
    AssignCollections,
    PromisingTemplate,
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
          status: "Promise To Pay",
          text: "Promise To Pay",
        },
        {
          status: "My Collections",
          text: "My Collections",
        },
        {
          status: "Unassigned",
          text: "Unassigned",
        },
        // {
        //   status: "closed",
        //   text: "Closed",
        // },
        
      ],
    };
  },
  methods: {
    async fetchTable(event: TableRequestEvent) {
      this.currentStatus = event.status as string;
      localStorage.removeItem('collectionData');
      //if (event.status === "all") {
        event.status = ['in-repayment delinquent1',
            'in-repayment delinquent2',
            'in-repayment delinquent3',
            'in-repayment delinquent4'];
      //}
      event.type = 'collections';

      const { data } = await adminDashboardRequests.getLoans({ ...event });
      const { items: rows, total: totalRows } = data;
      const rows2 = [];
      if (this.currentStatus === "Promise To Pay"){
        let index = 0;
        for(const x in rows){
            if(rows[index]["collectionsAccountStatus"] && rows[index]["collectionsAccountStatus"] == "PROMISE_TO_PAY"){
              rows2.push(rows[index])
            }
            index = index + 1;
        }
        
        rows2.sort(function(a, b) {
        a = new Date(a.collectionPromiseDate);
        b = new Date(b.collectionPromiseDate);
        const results = a > b ? -1 : a < b ? 1 : 0;
        return results * -1;
      });
        this.rows = rows2 as [];
        this.totalRows = rows2.length;
      }else if (this.currentStatus === "My Collections"){
        const admin = localStorage.getItem('adminToken')!
        const adminRole = JSON.parse(admin);
         let index = 0;
        for(const x in rows){
            if(rows[index]["collectionAssignedUser"] && rows[index]["collectionAssignedUser"] == adminRole.id){
              rows2.push(rows[index])
            }
            index = index + 1;
        }
             
        this.rows = rows2 as [];
        this.totalRows = rows2.length;
      }else if (this.currentStatus === "Unassigned"){
         let index = 0;//Unassigned
        for(const x in rows){
          if((rows[index]["collectionAssignStatus"] && rows[index]["collectionAssignStatus"] == 'Unassigned') || rows[index]["collectionAssignStatus"] === undefined){
            rows2.push(rows[index])
          }
          index = index + 1;
        }
             
        this.rows = rows2 as [];
        this.totalRows = rows2.length;
      }
      else{
        this.rows = rows;
        this.totalRows = totalRows;
      }
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
  // async mounted() {
    
  // }
});
</script>
