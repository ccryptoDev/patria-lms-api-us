<template>
  <Layout :login="true">
    <div id="login-form">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-sm-12">
            <div class="page-main-title">Patria Lending Forgot Password</div>
            <div class="page-subtitle">
              Reset your account password.
            </div>

            <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
              <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
                <div
                  class="d-flex flex-column justify-content-center align-items-center"
                >
                  <b-col md="8">
                    <ValidationProvider
                      name="Email"
                      :rules="{ required: true, email: true }"
                      v-slot="validationContext"
                    >
                      <b-form-group>
                        <b-form-input
                          v-model="email"
                          placeholder="Email"
                          :state="getValidationState(validationContext)"
                        ></b-form-input>

                        <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                        }}</b-form-invalid-feedback>
                      </b-form-group>
                    </ValidationProvider>
                  </b-col>
                </div>

                <div class="form-group text-center" style="margin-bottom: 70px">
                  <button
                    :disabled="isSubmitting"
                    class="btn btn-primary"
                    type="submit"
                  >
                    Forgot Password
                  </button>
                </div>

                <div class="form-simple-text mb-3">
                  <router-link
                    to="/login"
                    style="color: #363636"
                    class="font-weight-bold linkLogin"
                    >Return to login</router-link
                  >
                </div>
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
import { forgotPassword } from "@/user-application/authentication/api";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  components: {
    Layout,
  },

  data() {
    return {
      email: null as null | string,
      isSubmitting: false,
    };
  },
  methods: {
    getValidationState({
      validated,
      valid = null,
    }: {
      validated: boolean;
      valid: boolean | null;
    }) {
      return validated ? valid : null;
    },
    async onSubmit() {
      try {
        this.isSubmitting = true;
        await forgotPassword(this.email || "");

        await this.$swal({
          title: "Success!",
          text: `An email message has been sent to ${this.email}`,
          icon: "success",
        });

        await this.$router.push({ name: "userLogin" });
        this.isSubmitting = false;
      } catch (error) {
        if (error.response?.status !== 400) {
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
      }
    },
  },
});
</script>
