<template>
  <Layout>
    <div id="login-form">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-sm-12">
            <div
              class="page-subtitle"
              style="margin-top: 25px; font-weight: bold"
            >
              <h3>
                Please Confirm Do you want to close your loan with Patria Lending
              </h3>
            </div>
            <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
              <b-form
                autocomplete="off"
                @submit.stop.prevent="handleSubmit(onSubmit)"
              >
                

                <div class="form-group text-center" style="margin-bottom: 10px">
                  <button
                    type="Confirm"
                    class="btn btn-primary btn-lg"
                    :disabled="isSubmitting"
                    
                  >
                    Confirm
                  </button>
                </div>
                <!-- <div class="form-simple-text mb-3">
                  <router-link
                    to="/dashboard"
                    style="color: #363636"
                    class="font-weight-bold linkLogin"
                    >Return to customer portal</router-link
                  >
                </div> -->
              </b-form>
            </ValidationObserver>
          </div>
        </div>
         <div
      style="margin: 8px 0px; height: 49px; display: flex; align-items: center;"
    >
      <h3>Payment Transactions</h3>
    </div>
    <div v-if="payments && payments.length >= 1">
      <table>
        <thead>
          <tr>
            <th style="width: 10px">#</th>
            <th>Start balance</th>
            <th>PMT Reference</th>
            
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
      </div>
    </div>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "@/user-application/layout/pages/Layout.vue";
import { refundPaymentData, getPaymentSchedule } from "@/user-application/authentication/api";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  components: {
    Layout,
  },
  data() {
    return {
      annualIncome: null as null | string,
      token: null as null | string,
      isSubmitting: false,
      paymentManagement: [] as any,
    };
  },

  computed: {
    payments(): undefined | any[] {
      if (this.paymentManagement && this.paymentManagement.paymentSchedule) {
        const response = this.paymentManagement.paymentSchedule.filter(
          (payment: any) =>
            payment.status === "paid"
        );
        
        return response;
      }
      return undefined;
    },
  },

  methods: {
    
    async onSubmit() {
      try {
        this.isSubmitting = true;
        //refundPaymentData
        const requestBody = {
          token: this.token || "",
          requestId: "",
        };
        await refundPaymentData(requestBody);
        await this.$swal({
          title: "Success!",
          text: "Refund Initiated Successfully",
          icon: "success",
        });
        await this.$router.push({ name: "userLogin" });

      } catch (error) {
        this.isSubmitting = false;

        let errorMessage = "";
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = error.message;
        }

        showErrorToast(this, "error", errorMessage);
      }
    },
  },
  async mounted() {
    this.token = this.$route.params.token;
    try {

      const { data } = await getPaymentSchedule(
        this.token
      );

      this.paymentManagement = data;
      
    } catch (error) {
      if (error.response.status === 404) {
        return;
      }
    }
  },
});

</script>
