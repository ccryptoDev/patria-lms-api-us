<template>
  <div class="side-nav-container">
    <div class="side-nav-header">
      <img class="side-nav-logo" src="../../../../public/assets/images/img/logo.svg" alt="Company Logo" />
    </div>
    <ul class="side-nav-links">
      <li>
        <router-link active-class="selected" class="side-nav-link" to="/admin/dashboard">
          <i class="material-icons">dashboard</i>
          <span>Dashboard</span>
        </router-link>
      </li>
      <li>
        <router-link active-class="selected" class="side-nav-link" to="/admin/opportunities">
          <i class="material-icons">article</i>
          <span>Application status</span>
        </router-link>
      </li>
      <li>
        <router-link active-class="selected" class="side-nav-link" to="/admin/manual-review">
          <i class="material-icons">article</i>
          <span>Manual Review</span>
        </router-link>
      </li>
      <li v-if="userData.role === adminRoles.SuperAdmin">
        <router-link active-class="selected" class="side-nav-link" to="/admin/approvals">
          <i class="material-icons">article</i>
          <span>Admin Approvals</span>
        </router-link>
      </li>
      <li v-if="userData.role === adminRoles.SuperAdmin">
        <router-link active-class="selected" class="side-nav-link" to="/admin/needs-review">
          <i class="material-icons">info</i>
          <span>Delinquent Loans</span>
        </router-link>
      </li>
      <li v-if="
        userData.role === adminRoles.ManagerLA ||
        userData.role === adminRoles.SuperAdmin
      ">
        <router-link active-class="selected" class="side-nav-link" to="/admin/action-items">
          <i class="material-icons">info</i>
          <span>Action Items</span>
        </router-link>
      </li>
      <li>
        <router-link active-class="selected" class="side-nav-link" to="/admin/lending-center">
          <i class="material-icons">folder</i>
          <span>Lending Center</span>
        </router-link>
      </li>
      <li v-if="
        userData.role === adminRoles.ManagerLA ||
        userData.role === adminRoles.SuperAdmin
      ">
        <router-link active-class="selected" class="side-nav-link" to="/admin/manage-admin-users">
          <i class="material-icons">group</i>
          <span>Manage Admin</span>
        </router-link>
      </li>
      <li>
        <router-link active-class="selected" class="side-nav-link" to="/admin/manage-users">
          <i class="material-icons">group</i>
          <span>Manage Borrowers</span>
        </router-link>
      </li>
      <!-- <li
        v-if="
          userData.role === adminRoles.ManagerLA ||
            userData.role === adminRoles.SuperAdmin
        "
      >
        <router-link
          active-class="selected"
          class="side-nav-link"
          to="/admin/manage-practice"
        >
          <i class="material-icons">store</i>
          <span>Manage Practices</span>
        </router-link>
      </li> -->
      <!-- Hidden for release 11-12-21 -->
      <!-- <li
        v-if="
          userData.role === adminRoles.ManagerLA ||
            userData.role === adminRoles.SuperAdmin
        "
      >
        <router-link
          v-if="userData.role === adminRoles.SuperAdmin"
          active-class="selected"
          class="side-nav-link"
          to="/admin/collections"
        >
          <i class="material-icons">history</i>
          <span>Collections</span>
        </router-link>
      </li> -->
      <li v-if="
        userData.role === adminRoles.ManagerLA ||
        userData.role === adminRoles.SuperAdmin
      ">
        <router-link v-if="userData.role === adminRoles.SuperAdmin" active-class="selected" class="side-nav-link"
          to="/admin/collections">
          <i class="material-icons">history</i>
          <span>Collections</span>
        </router-link>
      </li>
      <li v-if="
        userData.role === adminRoles.ManagerLA ||
        userData.role === adminRoles.SuperAdmin
      ">
        <router-link v-if="userData.role === adminRoles.SuperAdmin" active-class="selected" class="side-nav-link"
          to="/admin/audit-log">
          <i class="material-icons">history</i>
          <span>Audit Log</span>
        </router-link>
      </li>
      <li v-if="
        userData.role === adminRoles.ManagerLA ||
        userData.role === adminRoles.SuperAdmin
      ">
        <router-link active-class="selected" class="side-nav-link" to="/admin/manage-loan-settings">
          <i class="material-icons">settings</i>
          <span>Loan Settings</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { getUserData } from "@/admin-dashboard/authentication/helpers";
import { getAdminRoles } from "@/admin-dashboard/helpers";

export default Vue.extend({
  data() {
    return {
      userData: getUserData(),
      adminRoles: getAdminRoles(),
    };
  },
});
</script>

<style scoped>
.side-nav-container {
  width: 100%;
  height: 100vh;
  background-color: white;
  position: relative;
  z-index: 11;
  display: flex;
  flex-direction: column;

  box-shadow: 0 1px 3px rgb(0 0 0 / 12%), 0 1px 2px rgb(0 0 0 / 24%);
  border-top-right-radius: 30px;
  border-bottom-right-radius: 30px;
}

.side-nav-header {
  width: 100%;
  height: 100px;
  display: flex;
  justify-content: center;
  border-bottom: 2px solid #fdf2f7;
}

.side-nav-logo {
  width: 200px;
  margin: 0 auto;
}

ul {
  padding: 0;
  list-style-type: none;
}

.side-nav-links {
  color: #3c4858;
}

.side-nav-link {
  user-select: none;
  height: 42px;
  font-size: 13px;
  margin: 10px 15px 0;
  padding: 10px 15px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.side-nav-link i {
  font-size: 24px;
  float: left;
  margin-right: 15px;
  line-height: 17px;
  width: 30px !important;
  text-align: center;
  color: #a9afbb;
}

.side-nav-link:hover {
  text-decoration: none;
  background-color: #eee;
}

.selected {
  color: #ea4c89;
}
</style>
