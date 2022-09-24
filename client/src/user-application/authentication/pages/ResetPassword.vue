<template>
  <Layout v-if="token" :login="true">
    <div id="login-form">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-sm-12">
            <div
              class="page-subtitle"
              style="margin-top: 25px; font-weight: bold"
            >
              <h3>
                Reset your account password down below.
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
                    <ValidationProvider
                      name="Password"
                      :rules="{ required: true, password: true }"
                      v-slot="validationContext"
                    >
                      <b-form-group
                        label="Password*"
                        label-for="password"
                        label-align="center"
                      >
                        <b-form-input
                          type="password"
                          id="password"
                          v-model="password"
                          :state="getValidationState(validationContext)"
                        >
                        </b-form-input>

                        <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                        }}</b-form-invalid-feedback>
                      </b-form-group>
                    </ValidationProvider>
                  </b-col>

                  <b-col md="9" class="mb-4">
                    <ValidationProvider
                      name="Confirm Password"
                      :rules="{ required: true, password: true }"
                      v-slot="validationContext"
                    >
                      <b-form-group
                        label="Confirm Password*"
                        label-for="confirmPassword"
                        label-align="center"
                      >
                        <b-form-input
                          type="password"
                          id="confirmPassword"
                          v-model="confirmPassword"
                          :state="getPasswordValidationState(validationContext)"
                        >
                        </b-form-input>

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
                    Reset Password
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
import { resetPassword } from "@/user-application/authentication/api";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  components: {
    Layout,
  },
  data() {
    return {
      password: null as null | string,
      confirmPassword: null as null | string,
      token: null as null | string,
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
    getPasswordValidationState({
      validated,
      valid = null,
    }: {
      validated: boolean;
      valid: null | boolean;
    }) {
      return validated
        ? valid &&
            this.password &&
            /^(?=.*?[a-zA-Z])(?=.*?[0-9]).{8,}$/.test(this.password) &&
            this.confirmPassword === this.password
        : null;
    },
    async onSubmit() {
      try {
        this.isSubmitting = true;

        await resetPassword(this.token || "", this.password || "");
        await this.$swal({
          title: "Success!",
          text: "Password successfully changed.",
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
