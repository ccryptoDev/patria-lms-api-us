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
                Update your SSN number with annual income.
              </h3>
            </div>
            <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
              <b-form
                autocomplete="off"
                @submit.stop.prevent="handleSubmit(onSubmit)"
              >
                <div
                  class="d-flex flex-column justify-content-center align-items-center"
                >
                  <b-col md="9">
                    
                           <b-form-group
                          label="Social Sec*"
                          label-for="socialSec"
                          label-align="center"
                        >
                          <b-form-row>
                            <b-col md="4">
                              <ValidationProvider
                                name="Social SEC"
                                :rules="{ required: true, min: 3, max: 3 }"
                                v-slot="validationContext"
                              >
                                <b-form-group>
                                  <b-form-input
                                    id="socialSec"
                                    ref="socialSec1"
                                    @keyup="ssnInputFocus()"
                                    v-mask="'###'"
                                    v-model="socialSec1"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                  ></b-form-input>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>

                            <b-col md="4">
                              <ValidationProvider
                                name="Social SEC1"
                                :rules="{ required: true, min: 2, max: 2 }"
                                v-slot="validationContext"
                              >
                                <b-form-group>
                                  <b-form-input
                                    v-mask="'##'"
                                    v-model="socialSec2"
                                    ref="socialSec2"
                                    @keyup="ssnInputFocus()"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                  ></b-form-input>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>

                            <b-col md="4">
                              <ValidationProvider
                                name="Social SEC2"
                                :rules="{ required: true, min: 4, max: 4 }"
                                v-slot="validationContext"
                              >
                                <b-form-group>
                                  <b-form-input
                                    v-mask="'####'"
                                    v-model="socialSec3"
                                    ref="socialSec3"
                                    @keyup="ssnInputFocus()"
                                    :state="
                                      getValidationState(validationContext)
                                    "
                                  ></b-form-input>

                                  <b-form-invalid-feedback>{{
                                    validationContext.errors[0]
                                  }}</b-form-invalid-feedback>
                                </b-form-group>
                              </ValidationProvider>
                            </b-col>
                          </b-form-row>
                        </b-form-group>
                    
                  </b-col>

                   <b-col md="6">
                        <ValidationProvider
                          name="Gross Annual Income"
                          :rules="{ required: true }"
                          v-slot="validationContext"
                        >
                          <b-form-group
                            label="Gross Annual Income*"
                            label-for="annualIncome"
                            label-align="center"
                          >
                            <b-form-input
                              id="annualIncome"
                              v-mask="incomeMask"
                              v-model="annualIncome"
                              :state="getAnnualIncomeValidationState()"
                            ></b-form-input>
                            <span class="input-info"
                              >Must be greater than $12K per year </span
                            >

                            <b-form-invalid-feedback>{{
                              validationContext.errors[0]
                            }}</b-form-invalid-feedback>
                          </b-form-group>
                        </ValidationProvider>
                      </b-col>
                </div>

                <div class="form-group text-center" style="margin-bottom: 10px">
                  <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                    :disabled="isSubmitting"
                    
                  >
                    Update
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
      </div>
    </div>
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "@/user-application/layout/pages/Layout.vue";
import {  updateCustomerData } from "@/user-application/authentication/api";
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
      socialSec1: null as null | string,
      socialSec2: null as null | string,
      socialSec3: null as null | string,
    };
  },

  computed:{
       // TODO refactor this
    parsedAnualIncome(): number {
      if (typeof this.annualIncome === "string") {
        return +this.annualIncome.replace(/[$,]/g, "");
      } else {
        return 0;
      }
    },
  },

  methods: {
    getValidationState({
      validated,
      valid = null,
    }: {
      validated: boolean;
      valid: null | boolean;
    }) {
      return validated ? valid : null;
    },
     ssnInputFocus(){
      if(this.socialSec1 && this.socialSec1.length == 3){
          const ss2 =  this.$refs.socialSec2 as any;
          ss2.focus()
      }
      if(this.socialSec2 && this.socialSec2.length == 2 && this.socialSec1 && this.socialSec1.length == 3){
          const ss3 =  this.$refs.socialSec3 as any;
          ss3.focus()
      }     
    },

     getAnnualIncomeValidationState(){
      const annualIncome = this.parsedAnualIncome;
      if(!annualIncome){
        return null;
      }
      if (annualIncome < 12000) {
        
        return false;
      }
      return true;
    },
    
    async onSubmit() {
      const ssnNumber = this.socialSec1 && this.socialSec2 && this.socialSec3
              ? `${this.socialSec1}${this.socialSec2}${this.socialSec3}`
              : "";
      
      try {
        this.isSubmitting = true;
        const annualIncome1 = `${this.parsedAnualIncome}`;
        const requestBody = {
          token: this.token || "",
          ssn: ssnNumber || "",
          annualIncome: annualIncome1 || "",
          requestId: "",
        };
        await updateCustomerData(requestBody);
        await this.$swal({
          title: "Success!",
          text: "Details successfully updated.",
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
  mounted() {
    this.token = this.$route.params.token;
  },
});

</script>
