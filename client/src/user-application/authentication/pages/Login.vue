<template>
  <Layout>
    <div id="login-form">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-6 col-sm-12">
            <div class="page-main-title">Patria Lending Client Login</div>
            <div class="page-subtitle">
              Access your account information by logging in below.
            </div>

            <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
              <b-form autocomplete="off" @submit.stop.prevent="handleSubmit(onSubmit)">
                <div class="d-flex flex-column justify-content-center align-items-center">
                  <b-col md="9">
                    <ValidationProvider name="Email" :rules="{ required: true, email: true }"
                      v-slot="validationContext">
                      <b-form-group label="Email*" label-for="email" label-align="center">
                        <b-form-input id="email" v-model="email" :state="getValidationState(validationContext)">
                        </b-form-input>

                        <b-form-invalid-feedback>{{
                            validationContext.errors[0]
                        }}</b-form-invalid-feedback>
                      </b-form-group>
                    </ValidationProvider>
                  </b-col>

                  <b-col md="9" class="mb-4">
                    <ValidationProvider name="New Password" :rules="{ required: true }" v-slot="validationContext">
                      <b-form-group label="Password*" label-for="password" label-align="center">
                        <b-form-input type="password" id="password" v-model="password"
                          :state="getValidationState(validationContext)">
                        </b-form-input>

                        <b-form-invalid-feedback>{{
                            validationContext.errors[0]
                        }}</b-form-invalid-feedback>
                      </b-form-group>
                    </ValidationProvider>
                  </b-col>
                </div>

                <div class="form-group text-center" style="margin-bottom: 70px">
                  <button class="btn btn-primary btn-lg" :disabled="isSubmitting" type="submit">
                    LOGIN
                  </button>
                </div>

                <div class="form-simple-text mb-3">
                  Forgot Your Password?
                  <router-link to="forgot-password" style="color: #363636" class="font-weight-bold linkLogin">Reset here
                  </router-link>
                </div>

                <div class="form-simple-text">
                  Can't Login?
                  <span @click="onStartHereHandler" style="color: #363636; font-style: italic; cursor: pointer;">Start
                    here</span>
                  <!-- <router-link to="/apply" style="color: #363636" class="font-weight-bold linkLogin">Start here
                  </router-link> -->
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
import { login } from "@/user-application/authentication/api";
import { getApplicationData } from "@/user-application/application/api";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  components: {
    Layout,
  },

  data() {
    return {
      email: null as null | string,
      password: null as null | string,
      isSubmitting: false,
    };
  },
  methods: {
    onStartHereHandler(event: any) {
      window.location.href = process.env.VUE_APP_LOS_URL;
    },
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
        const requestBody = {
          email: this.email ? this.email.toLowerCase().trim() : "",
          password: this.password || "",
        };
        const { data: jwtToken } = await login(requestBody);
        localStorage.setItem("userToken", JSON.stringify(jwtToken));

        const { data: applicationData } = await getApplicationData();
        // if (!applicationData.isCompleted) {
        // console.log("applicationData.isCompleted", applicationData)

        // await this.$router.push({ name: applicationData.lastStep });
        // } else {
        console.log("first==== pushing to user dashboard")
        await this.$router.push({ name: "userDashboard" });
        // }
      } catch (error) {
        console.log("error===", error);
        this.isSubmitting = false;

        let errorMessage = "";
        if (error?.response?.status === 401) {
          errorMessage = "Email or password invalid.";
        } else if (error?.response?.data?.statusCode && error?.response?.data?.statusCode == 400) {
          errorMessage = error.response.data.message;
        }
        else {
          errorMessage = error.message;
        }

        showErrorToast(this, "error", errorMessage);
      }
    },
  },
});
</script>
