
<template>

  <BaseTable :title="title" :fields="fields" :rows="rows" :screenTitle="screenTitle" :onSort="onSort">
    <template #cell(check)="data">
      <div v-if="screenTitle != 'Lending'">
        <b-form-row>
          <input type="checkbox" class="isCollection" :id="data.item.screenTrackingId"
            :value="data.item.screenTrackingId"
            v-on:change="onCheckboxInput($event, data.item.email, title, data.item.screenTrackingId, data.item.status)">
          <label for="checkbox" class="collectionLabel">{{ data.item.idKeyName }}</label>
        </b-form-row>
      </div>
    </template>
    <template #cell(name)="data">
      <router-link :to="`/admin/loan-details/${data.item.screenTrackingId}`">{{
          data.item.name
      }}</router-link>
    </template>
    <template #cell(approvedUpTo)="data">
      {{ data.item.approvedUpTo | currency }}
    </template>
    <template #cell(selectedAmount)="data">
      {{ data.item.currentBalance | currency }}
    </template>
    <template #cell(phone)="data">
      {{ data.item.phone | phone }}
    </template>
    <template #cell(dateCreated)="data">
      {{ data.item.dateCreated | timestamp }}
    </template>
    <template #cell(assignedTo)="data">
      <div v-if="screenTitle != 'Lending' && data.item.collectionAssignedUser">
        <label for="assignedTo" class=data> {{ data.item.collectionAdmin }} </label>
      </div>
    </template>
    <!-- <template #cell(edit)="data">
   <div v-if="title != 'Closed Applications'">
     <button class="btn btn-primary mr-2 mb-2 text-center" style=" background-color: #ea4c89" 
                     @click="customerEdit(data.item.email)"> Edit </button>
   </div> -->


    <!-- <button class="btn btn-primary mr-2 mb-2 text-center" style=" background-color: #ea4c89" 
                     @click="closeLoan(data.item.email)"> Close </button> -->

<!-- </template> -->
  </BaseTable>
</template>

<script lang="ts">
import Vue from "vue";

import BaseTable from "../../base/Table.vue";
import { updateCustomerDetails, closeLoanDetails, moveLoanCollections } from "@/user-application/authentication/api";
import { refundPaymentData, getPaymentSchedule } from "@/user-application/authentication/api";
import { adminDashboardRequests } from "@/api/admin-dashboard";
export default Vue.extend({
  name: "IncompleteTemplate",
  components: { BaseTable },

  data() {
    return {
      collectionData: [{}],
      userData: [],
      adminUsers: [] as {
        email: string;
        role: string;
        id: string;
      }[],
      fields: [
        "name",
        { key: "status", label: "Loan Status" },
        { key: "approvedUpTo", label: "Approved Up To Amount" },
        { key: "selectedAmount", label: "Current Balance" },
        { key: "dateCreated", label: "Date Created" },
        { key: "phone", label: "Phone Number" },
        { key: "email", label: "Email Address" },
        { key: "location", label: "Location" },
        { key: "assignedTo", label: this.screenTitle != 'Lending' ? "Assigned To" : '' },
        { key: "check", label: this.screenTitle != 'Lending' ? "Assign" : '' },
        { key: "edit", label: "" },
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

  async mounted() {

    const { data } = await adminDashboardRequests.getAdmin(

    );



    if (data && data.rows.length > 0) {
      this.adminUsers = data.rows.filter(
        (admin: any) => admin.role == 'Super Admin'
      );
    }
  },

  methods: {
    async getUserinfos(id: string): Promise<string> {
      try {

        if (id && id != '') {
          this.adminUsers = this.adminUsers.filter(
            (admin: any) => admin.id === id
          );
          return "PSK";
        } else {
          return 'Unassigned';
        }
      } catch (error) {
        return '';
      }
    },
    async closeLoan(email: string) {
      this.$swal.fire({
        title: 'Would you like to send the closing loan link to customer',
        showCancelButton: true,
        icon: "info",
        reverseButtons: false,
        confirmButtonText: `Continue`,
        cancelButtonText: `Cancel`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          console.log("Confirm");
          try {

            closeLoanDetails(email || "");
            this.$swal({
              title: "Alert",
              text: "Email sent",
              icon: "success",
            });
          } catch (error) {
            this.$swal({
              title: "Alert",
              text: "Link could not be send.",
              icon: "info",
            });
          }
        } else if (result.isDenied) {
          return false;
        }
      })
    },
    //check: function(e: any) {
    onCheckboxInput(e: any, checkboxName: string, titleLabel: string, id: string, status: string) {
      // if (this.errors[checkboxName]) {
      //   this.errors[checkboxName] = null;
      // }
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
      //this.collectionsData = this.collectionData;
      //       if(!titleLabel.includes("Collections")){
      //          if(status != 'paid' && status != 'closed'){
      //               try{

      //       let titleString = 'Do you want to move this loan to collections';
      //       if(titleLabel.includes("Collections")){
      //         titleString = "Do you want to move this loan out of collections";
      //       }
      //       this.$swal.fire({
      //         title: titleString,
      //         showCancelButton: true,
      //         icon: "info",
      //         reverseButtons: false,
      //         confirmButtonText: `Yes`,
      //         cancelButtonText: `Cancel`,
      //         }).then(async (result) => {
      //         if (result.isConfirmed) {

      //           try{

      //           const moveResult = await moveLoanCollections(checkboxName, titleLabel);
      //           console.log("Confirm moveResult" + JSON.stringify(moveResult));
      //           this.$router.go(0);
      //           }catch(error){
      //             console.log("Error");
      //             this.$swal({
      //           title: "Alert",
      //           text: "Loan cannot be moved",
      //           icon: "info",
      //           confirmButtonText: `Ok`,
      //       }).then(async (result) => {
      //         if(result.isConfirmed){
      //           this.$router.go(0);
      //         }
      //       });

      //           }
      //         } else if (result.isDismissed) {

      //         //this.$router.go(0) 
      //         return false;
      //          }
      // })
      //       }catch(error){

      //         this.$swal({
      //           title: "Alert",
      //           text: "Loan cannot be moved to collections",
      //           icon: "info",
      //       });
      //     }
      //       }
      //       else{
      //            this.$swal({
      //           title: "Alert",
      //           text: "Loan cannot be moved to collections",
      //           icon: "info",
      //           confirmButtonText: `Ok`,
      //       }).then(async (result) => {
      //         if(result.isConfirmed){
      //           this.$router.go(0);
      //         }
      //       });
      //       }
      //       }


    },

    async customerEdit(email: string) {
      this.$swal.fire({
        title: 'Would you like to send the update link to customer',
        showCancelButton: true,
        icon: "info",
        reverseButtons: false,
        confirmButtonText: `Continue`,
        cancelButtonText: `Cancel`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          try {

            updateCustomerDetails(email || "");
            this.$swal({
              title: "Alert",
              text: "Email sent",
              icon: "success",
            });
          } catch (error) {
            this.$swal({
              title: "Alert",
              text: "Link could not be send",
              icon: "info",
            });
          }
        } else if (result.isDenied) {
          return false;
        }
      })
    },
  },

  props: {
    title: {
      required: false,
      default: null,
      type: String,
    },
    screenTitle: {
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
    collectionsData: {
      required: false,
      default: () => [],
      type: Array,
    },
  },
});
</script>
