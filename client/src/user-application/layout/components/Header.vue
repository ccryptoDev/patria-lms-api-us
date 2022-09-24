<template>
  <header>
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <div class="d-flex justify-content-between align-items-center">
            <div class="header-logo">
              <img src="../../../../public/assets/images/laseraway.svg" />
            </div>
            <div v-if="login" class="header-actions">
              <div style="text-decoration: underline;">
                  <router-link
                      to="/change-password"
                      style="color: #363636; margin:20px"
                      class="linkLogin"
                      >Change Password</router-link
                  >
              </div>
              <a
                v-if="isAuthenticated"
                @click="removeToken"
                class="btn btn-link"
                >Exit</a
              >
              <router-link v-else to="/login" class="btn btn-link"
                >Login</router-link
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import Vue from "vue";
import { mapMutations } from "vuex";

import { isUserAuthenticated } from "@/user-application/authentication/helpers";

export default Vue.extend({
  props: {
    login: {
      required: false,
      type: Boolean,
    },
  },

  data() {
    return {
      isAuthenticated: false,
    };
  },
  methods: {
    ...mapMutations(["setStep"]),
    async removeToken() {
      localStorage.removeItem("userToken");
      localStorage.setItem("appclient-logout", 'logout' + Math.random());
      this.setStep(1);
      await this.$router.push({ name: "userLogin" });
    },
  },

   mounted() {
    window.addEventListener('storage',  async function(event){
      if (event.key == "appclient-logout") {
        this.location.reload();
      }
    }, false);
  },

  created() {
    this.isAuthenticated = isUserAuthenticated();
  },
});
</script>
