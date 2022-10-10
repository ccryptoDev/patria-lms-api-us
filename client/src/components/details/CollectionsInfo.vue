<template>
  <div>
    <div>
      <h3 style="margin: 10px 0 10px 10px; font-weight: bold">Collections</h3>
    </div>
    <div
      v-if="isInRepayment"
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 8px 0px;
      "
    >
      <h3></h3>
      <!-- Disabled for now, waiting for LPP disbursement integration. -->
      <!-- <button class="primary" style="margin-right: 10px; background-color: #ea4c89; color: white;" @click="partialReturn(email)">
        Partial Return
      </button> -->
    </div>

    <div
      v-if="isInRepayment || isPaid || isClosed"
      style="margin: 8px 0px; height: 29px; display: flex; align-items: center"
    >
      <h5>Past Due Payments</h5>
    </div>
    <div v-if="payments && payments.length >= 1">
      <table>
        <thead>
          <tr>
            <th style="width: 10px">#</th>
            <th>Start balance</th>
            <th>PMT Reference</th>
            <th>Status</th>
            <th>Payment Type</th>
            <th>Amount</th>
            <th>Applied to Fees</th>
            <th>Applied to Interest</th>
            <th>Applied to Principal</th>
            <th>End Principal Balance</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(payment, index) in payments" :key="payment.paymentId">
            <td>{{ index + 1 }}</td>
            <td>{{ payment.startPrincipal | currency }}</td>
            <td>{{ payment.paymentReference }}</td>
            <td>{{ payment.status }}</td>
            <td>{{ payment.paymentType }}</td>
            <td>{{ payment.amount | currency }}</td>
            <td>{{ payment.paidFees | currency }}</td>
            <td>
              {{
                (payment.paidInterest + payment.paidPastDueInterest) | currency
              }}
            </td>
            <td>{{ payment.paidPrincipal | currency }}</td>
            <td>{{ payment.endPrincipal | currency }}</td>
            <td>{{ payment.date | date }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="this.paymentManagement.promiseToPay && this.paymentManagement.promiseToPay.length >= 1" style="margin: 18px 0px;"> 
        <h5>Promise to pay</h5>
        <table>
        <thead>
          <tr>
            <th style="width: 10px">#</th>
            <th style="max-width: 140px">Promised Date</th>
            <th>Amount</th>
            <th>Loan Status</th>
            <th>Promise Status</th>
            <th>Description</th>
            <th>Assigned to</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(promise, index) in this.paymentManagement.promiseToPay" :key="promise.index">
            <td>{{ index + 1 }}</td>
            <td style="max-width: 140px">{{ promise.contactScheduleReminderDate | timestamp }}</td>
            <td>{{ promise.contactScheduleReminderAmount | currency }}</td>
            <td style="max-width: 140px">{{ paymentManagement.status }}</td>
            <td>{{ promise.contactScheduleReminderStatus ? promise.contactScheduleReminderStatus : 'Pending' }}</td>
            <td>{{ promise.promiseDescription ? promise.promiseDescription : '--' }}</td>
            <td>{{ paymentManagement.collectionAdmin ? promise.contactScheduleReminderStatus : '--' }}</td>
            <td>
              <div
                v-if="promise.contactScheduleReminderStatus == 'Pending'" style=" display: flex; align-items: center; flex-direction: column;"
              >
                <button class="primary" style="margin: 3px; background-color: #ea4c89; color: white; padding: 5px;" @click="complete(promise)">
                  Complete
                </button>
                <button class="primary" style="background-color: #ea4c89; color: white; padding: 5px;" @click="notcompleted(promise)">
                  Not Completed
                </button>
                <EditPromiseButton
                  :dateValue="todayDate(promise.contactScheduleReminderDate)"
                  :timeValue="getTime(promise.contactScheduleReminderDate)"
                  :scheduleValue="promise.contactScheduleReminderDate"
                  :amountValue=Number(promise.contactScheduleReminderAmount)
                  :idValue="getPaymentid()"
                /> 
                <RemovePromiseButton
                  :dateValue="todayDate(promise.contactScheduleReminderDate)"
                  :timeValue="getTime(promise.contactScheduleReminderDate)"
                  :scheduleValue="promise.contactScheduleReminderDate"
                  :amountValue=Number(promise.contactScheduleReminderAmount)
                  :idValue="getPaymentid()"
                /> 
              </div>
            </td>
          </tr>
        </tbody>
      </table>
       </div>
     
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
        <div class="cardForm shadow" style="margin: 18px 0px;">
          <h5 class="cardDetails">Promise To Pay</h5>

          <b-form-row>
            <b-col md="6">
              <ValidationProvider
                name="Open Date"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Select Date" label-for="openDate">
                  <Datepicker
                    v-model="openDate"
                    :format="'MM/dd/yyyy'"
                    :disabledDates="disabledDates"
                    :input-class="'w-100 form-control'"
                    :state="getValidationState(validationContext)"
                  />
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>
            <b-col md="6">
              <ValidationProvider
                name="State"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Select Time" label-for="state">
                  <b-form-select
                    id="state"
                    v-model="selectedState"
                    :options="timeValues"
                    class="form-control"
                  >
                  </b-form-select>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>
          </b-form-row>

          <b-form-row>
           <b-col md="6">
              <ValidationProvider
                name="Promised Payment Amount"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Promised Payment Amount" label-for="zip">
                  <b-form-input
                    id="amount"
                    v-model="amount"
                    placeholder=""
                    v-mask="'#####'"
                  ></b-form-input>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>
          </b-form-row>

          <div class="row">  
            <PromisePayButton
              :dateValue="todayDate(openDate)"
                :timeValue="selectedState"
                :amountValue="amount"
                :idValue="getPaymentid()"
                :stateString="getStateString()"
            />
          </div>
        </div>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
import { adminDashboardRequests } from "@/api/admin-dashboard";
import Vue from "vue";
import Datepicker from "vuejs-datepicker";
import moment from "moment";
// import MakePaymentButton from "@/components/buttons/MakePaymentButton.vue";
import { errorHandler } from "@/api/error-handler";
import { getUserData } from "@/admin-dashboard/authentication/helpers";
import { getAdminRoles } from "@/admin-dashboard/helpers";
import timeValuez from "@/helpers/selecttime";
import PromisePayButton from "@/components/buttons/PromisePayButton.vue";
import RemovePromiseButton from "@/components/buttons/RemovePromiseButton.vue";
import EditPromiseButton from "@/components/buttons/EditPromiseButton.vue";
//import { updateCustomerDetails , closeLoanDetails, partialReturnDetails } from "@/user-application/authentication/api";

export default Vue.extend({
  components: { Datepicker, PromisePayButton, RemovePromiseButton, EditPromiseButton },

  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },

  data() {
    return {
      adminRoles: getAdminRoles(),
      isInRepayment: false,
      isPaid: false,
      isClosed: false,
      paymentManagement: [] as any,
      userData: getUserData(),
      applicationData: [] as any,
      promiseDate: new Date(),
      promiseTime: new Date(),
      email: null as null | string,
      userName: null as null | string,
      collectionAdmin: null as null | string,
      amount: 0 as null | number,
      selectedState: null as null | string,
      openDate: new Date(),
      disabledDates: {
        to: moment().startOf("day").toDate(),
        from: moment().add(1, "months").startOf("day").toDate(),
      },
      documentTypes: [
        {
          value: null,
          text: "Select Document Type",
        },
        {
          value: "driversLicense",
          text: "Driver's License or ID",
        },
        {
          value: "passport",
          text: "Passport",
        },
      ],
      timeValue: timeValuez as { value: string }[],
      autopayStatus: false,
    };
  },

  async created() {
    try {
      const { data } = await adminDashboardRequests.getApplication(
        this.screenTrackingId
      );
      this.email = data.email;
      this.userName = data.name;
      this.collectionAdmin = data.collectionAdmin;
    } catch (error) {
      const errorMessage = await errorHandler(error, this.$router);
      if (errorMessage) {
        const Toast = this.$swal.mixin({
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 7000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", this.$swal.stopTimer);
            toast.addEventListener("mouseleave", this.$swal.resumeTimer);
          },
        });
        Toast.fire({ icon: "error", title: `${errorMessage}` });
      }
    }
  },

  computed: {
    paymentScheduleLeft(): any[] | undefined {
      if (this.paymentManagement && this.paymentManagement.paymentSchedule) {
        const response = this.paymentManagement.paymentSchedule.filter(
          (scheduleItem: any) => scheduleItem.status === "opened"
        );
        return response;
      }
      return undefined;
    },
    timeValues(): { value: string | null; text: string }[] {
      return this.timeValue.map((time) => {
        return {
          value: time.value,
          text: time.value,
        };
      });
    },
    assignedToUser(): string {
      
      return '';
    },
    payments(): undefined | any[] {
      const today = moment().startOf("day").toDate();
      if (this.paymentManagement && this.paymentManagement.paymentSchedule) {
        const response = this.paymentManagement.paymentSchedule.filter(
          (payment: any) =>
            payment.status === "opened" && moment(payment.date).isBefore(
            moment(today),
            "day"
          )
        );

        return response;
      }
      return undefined;
    },
  },

  methods: {
    async reloadPage() {
      try {
        const { data } = await adminDashboardRequests.getPaymentManagement(
          this.screenTrackingId
        );
        this.paymentManagement = data.response;
      } catch (error) {
        const errorMessage = await errorHandler(error, this.$router);
        if (errorMessage) {
          const Toast = this.$swal.mixin({
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 7000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener("mouseenter", this.$swal.stopTimer);
              toast.addEventListener("mouseleave", this.$swal.resumeTimer);
            },
          });
          Toast.fire({ icon: "error", title: `${errorMessage}` });
        }
      }
    },
    todayDate(dates: Date): string {
      return moment(dates).format("MM/DD/YYYY");
    },
    getTime(dates: Date): string {
      return new Date(dates).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    },
    getPaymentid(): string{
      return this.paymentManagement._id || "";
    },
    getValidationState({ validated, valid = null }: any) {
      return validated ? valid : null;
    },
    async complete(promise: Record<string, any>){
       try{
      const result = await this.$swal({
        title: `Promise to Pay Completed for <br> $${promise.contactScheduleReminderAmount} on ${ this.todayDate(promise.contactScheduleReminderDate) } at ${ this.getTime(promise.contactScheduleReminderDate) } ?`,
        showCancelButton: true,
        icon: "info",
        reverseButtons: true,
        confirmButtonText: `Confirm`,
        cancelButtonText: `Cancel`,
      });
      if(result.isConfirmed) {
        await adminDashboardRequests.changeStatusPromisetopay({
          paymentId: this.paymentManagement._id,
          promiseScheduleDate: promise.contactScheduleReminderDate,
          promiseScheduleStatus: "Done",
        });
        await this.$swal({
          title: "Alert",
          text: "Success!",
          icon: "success",
        });
      }
      this.reloadPage();
    }catch(error){
      const errorMessage = await errorHandler(error, this.$router);
      if (errorMessage) {
        const Toast = this.$swal.mixin({
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 7000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", this.$swal.stopTimer);
            toast.addEventListener("mouseleave", this.$swal.resumeTimer);
          },
        });
        Toast.fire({ icon: "error", title: `${errorMessage}` });
      }
    }
    },
    async notcompleted(promise: Record<string, any>){
      try{
      const result = await this.$swal({
        title: `Promise to Pay Incomplete for <br> $${promise.contactScheduleReminderAmount} on ${ this.todayDate(promise.contactScheduleReminderDate) } at ${ this.getTime(promise.contactScheduleReminderDate) } ?`,
        showCancelButton: true,
        icon: "info",
        reverseButtons: true,
        confirmButtonText: `Confirm`,
        cancelButtonText: `Cancel`,
      });
      if(result.isConfirmed) {
        await adminDashboardRequests.changeStatusPromisetopay({
          paymentId: this.paymentManagement._id,
          promiseScheduleDate: promise.contactScheduleReminderDate,
          promiseScheduleStatus: "Incomplete",
        });
        await this.$swal({
          title: "Alert",
          text: "Success!",
          icon: "success",
        });
      }
     this.reloadPage();
    }catch(error){
      const errorMessage = await errorHandler(error, this.$router);
      if (errorMessage) {
        const Toast = this.$swal.mixin({
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 7000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", this.$swal.stopTimer);
            toast.addEventListener("mouseleave", this.$swal.resumeTimer);
          },
        });
        Toast.fire({ icon: "error", title: `${errorMessage}` });
      }
    }
    },
    getStateString(): string{
      return "Create"
    }
    
  },

  async mounted() {
    try {
      const { data } = await adminDashboardRequests.getPaymentManagement(
        this.screenTrackingId
      );
      const pm = data.response;
      if (
        pm?.status === "in-repayment" ||
        pm?.status === "in-repayment prime" ||
        pm?.status === "in-repayment non-prime" ||
        pm?.status === "in-repayment delinquent1" ||
        pm?.status === "in-repayment delinquent2" ||
        pm?.status === "in-repayment delinquent3" ||
        pm?.status === "in-repayment delinquent4"
      ) {
        this.isInRepayment = true;
      } else if (pm?.status === "paid") {
        this.isInRepayment = false;
        this.isPaid = true;
      } else if (pm?.status === "closed") {
        this.isInRepayment = false;
        this.isPaid = false;
        this.isClosed = true;
      }
      this.paymentManagement = pm;
    } catch (error) {

      const errorMessage = await errorHandler(error, this.$router);
      if (errorMessage) {
        const Toast = this.$swal.mixin({
          toast: true,
          position: "top",
          showConfirmButton: false,
          timer: 7000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.addEventListener("mouseenter", this.$swal.stopTimer);
            toast.addEventListener("mouseleave", this.$swal.resumeTimer);
          },
        });
        Toast.fire({ icon: "error", title: `${errorMessage}` });
      }
    }
  },
});
</script>

<style scoped>
table {
  width: 100%;
  border: 1px solid #f4f4f4;
}
td {
  border: 1px solid #f4f4f4;
  padding: 10px;
}
tr > :first-child {
  font-weight: bold;
}
</style>
