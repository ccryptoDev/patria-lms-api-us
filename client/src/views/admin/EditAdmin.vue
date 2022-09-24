<template>
  <Layout>
    <ManageAdmin
      :adminId="adminId"
      :update="true"
      :currentEmail="email"
      :currentPhoneNumber="phoneNumber"
      :currentLocation="practiceManagement"
      :currentRole="role"
      :currentUserName="userName"
    />
  </Layout>
</template>

<script lang="ts">
import Vue from "vue";

import Layout from "../layouts/admin/Layout.vue";
import ManageAdmin from "@/components/details/ManageAdmin.vue";
import { adminDashboardRequests } from "@/api/admin-dashboard";
import { errorHandler } from "@/api/error-handler";

export default Vue.extend({
  components: {
    Layout,
    ManageAdmin,
  },

  data() {
    return {
      adminId: null as null | string,
      email: null,
      phoneNumber: null,
      practiceManagement: null,
      role: null,
      userName: null,
    };
  },

  async mounted() {
    try {
      const adminId = this.$route.params.id;
      this.adminId = adminId;
      const { data } = await adminDashboardRequests.getAdminById(adminId);
      const { email, phoneNumber, practiceManagement, role, userName } = data;

      this.email = email;
      this.phoneNumber = phoneNumber;
      this.practiceManagement = practiceManagement;
      this.role = role.roleName;
      this.userName = userName;
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
