<template>
  <div class="off-canvas-sidebar">
    <div
      class="page-header login-header login-page header-filter"
      filter-color="blue"
      style="background-image: url('https://wallpaperaccess.com/full/2317487.jpg'); background-size: cover;"
    >
      <div class="container ">
        <div class="login-box" style="position: relative; top: -7%;">
          <div class="login-logo">
            <img
              src="../../assets/images/img/logo-white.svg"
              class="login-logo-image"
              alt="User Image"
            />Admin
          </div>

          <br />

          <div class="card card-login login-box-body">
            <div class="card-header card-header-primary text-center">
              <h4 class="card-title">Welcome</h4>
            </div>

            <p class="card-description text-center">
              Type your email to generate a new password
            </p>

            <div class="card-body">
              <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
                <b-form
                  autocomplete="off"
                  @submit.stop.prevent="handleSubmit(onSubmit)"
                  id="loginForm"
                >
                  <ValidationProvider
                    name="Email"
                    :rules="{ required: true, email: true }"
                    v-slot="validationContext"
                  >
                    <b-form-group>
                      <b-form-input
                        id="email"
                        v-model="email"
                        :state="getValidationState(validationContext)"
                      >
                      </b-form-input>

                      <b-form-invalid-feedback>{{
                        validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>

                  <div class="flex-j-end" style="font-size: 10px;">
                    <router-link to="/admin/login"
                      >Return to the login</router-link
                    >
                  </div>

                  <div class="card-footer flex-j-center">
                    <button
                      type="submit"
                      class="btn btn-primary btn-link btn-lg"
                      :disabled="isSubmitting"
                    >
                      Generate New Password
                    </button>
                  </div>
                </b-form>
              </ValidationObserver>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { adminDashboardRequests } from "@/api/admin-dashboard";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  data() {
    return {
      email: null as null | string,
      password: null as null | string,
      isSubmitting: false,
    };
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
    async onSubmit() {
      try {
        this.isSubmitting = true;
        await adminDashboardRequests.forgotPassword(this.email || "");
        await this.$swal({
          title: "Success!",
          text: `An email message has been sent to ${this.email}`,
          icon: "success",
        });

        await this.$router.push({ name: "AdminLogin" });
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
});
</script>

<style scoped src="../../assets/styles/bootstrap/css/bootstrap.min.css"></style>
<style scoped src="../../../public/assets/styles/css/AdminLTE.min.css"></style>
<style scoped src="../../assets/styles/css/material-dashboard.css"></style>
<style scoped src="../../assets/styles/css/MySkin.css"></style>
<style scoped src="../../assets/styles/css/frontend/v3/layout.css"></style>
<style scoped>
label.error {
  left: 54px;
  margin-top: 5px;
  position: relative;
}
</style>
