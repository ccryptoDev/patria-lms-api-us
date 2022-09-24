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

          <div v-if="error" class="alert alert-danger alert-solid">
            {{ error }}
          </div>
          <br />

          <div class="card card-login login-box-body">
            <div class="card-header card-header-primary text-center">
              <h4 class="card-title">Welcome</h4>
            </div>

            <p class="card-description text-center">
              Sign in to start your session
            </p>

            <div class="card-body">
              <form @submit.prevent="onSubmit" id="loginForm">
                <span class="bmd-form-group">
                  <div class="input-group errorTxt-sib">
                    <div class="input-group-prepend">
                      <span class="input-group-text">
                        <i class="material-icons">email</i>
                      </span>
                    </div>
                    <input
                      v-model="email"
                      type="email"
                      id="email"
                      name="email"
                      class="form-control"
                      placeholder="Email"
                    />
                  </div>
                </span>

                <span class="bmd-form-group">
                  <div class="input-group errorTxt-sib">
                    <div class="input-group-prepend">
                      <span class="input-group-text">
                        <i class="material-icons">lock_outline</i>
                      </span>
                    </div>
                    <input
                      v-model="password"
                      type="password"
                      id="password"
                      name="password"
                      class="form-control"
                      placeholder="Password"
                    />
                  </div>
                </span>

                <div class="flex-j-end" style="font-size: 10px;">
                  <router-link to="/admin/reset-password"
                    >I forgot my password</router-link
                  >
                </div>

                <div class="card-footer flex-j-center">
                  <button type="submit" class="btn btn-primary btn-link btn-lg">
                    Sign In
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      error: "",
      email: "",
      password: "",
    };
  },

  methods: {
    async onSubmit() {
      try {
        await this.$store.dispatch("adminLogin", {
          email: this.email.toLowerCase().trim(),
          password: this.password,
        });
        this.$router.push("/admin/dashboard");
      } catch (error) {
        this.error = error.message;
      }
    },
  },
});
</script>
