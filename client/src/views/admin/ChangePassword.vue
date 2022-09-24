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
                Change your account password down below.
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
                          v-model="existingPassword"
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
                      name="New Password"
                      :rules="{ required: true, password: true }"
                      v-slot="validationContext"
                    >
                      <b-form-group
                        label="New Password*"
                        label-for="newPassword"
                        label-align="center"
                      >
                        <b-form-input
                          type="password"
                          id="newPassword"
                          v-model="newPassword"
                          :state="getValidationState(validationContext)"
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
                    Change Password
                  </button>
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

import Layout from "../layouts/admin/Layout.vue";
import showErrorToast from "@/helpers/errorToast";
import { adminDashboardRequests } from "@/api/admin-dashboard";

export default Vue.extend({
  components: { Layout },

  data() {
    return {
      newPassword: null as null | string,
      existingPassword: null as null | string,
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
        await adminDashboardRequests.changePassword(
          this.existingPassword || "",
          this.newPassword || ""
        );
        await this.$swal({
          title: "Success!",
          text: "Password successfully changed.",
          icon: "success",
        });

        await this.$router.push({ name: "adminDashboard" });
      } catch (error) {
        this.isSubmitting = false;

        let errorMessage = "";
        if (error.response.status === 400) {
          errorMessage = "Password invalid.";
        } else {
          errorMessage = error.message;
        }

        showErrorToast(this, "error", errorMessage);
      }
    },
  },
});
</script>
