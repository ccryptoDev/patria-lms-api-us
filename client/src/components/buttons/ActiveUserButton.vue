<template>
  <div v-click-outside="() => (showDropdown = false)" class="flex icon-button">
    <span>{{ adminName }}</span>
    <i @click="() => (showDropdown = !showDropdown)" class="material-icons icon"
      >person</i
    >
    <div v-if="showDropdown" class="dropdown-content">
      <ul class="side-nav-links">
        <router-link to="/admin/change-password" class="side-nav-link">
          <i class="material-icons">password</i><span>Change Password</span>
        </router-link>
        <a class="side-nav-link" @click="signout" id="linkLogout">
          <i class="material-icons">logout</i><span>Sign Out</span>
        </a>
      </ul>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import ClickOutside from "vue-click-outside";

export default Vue.extend({
  data() {
    return {
      showDropdown: false,
      adminName: null,
    };
  },

  methods: {
    async signout() {
      localStorage.removeItem("adminToken");
      localStorage.setItem("app-logout", 'logout' + Math.random());
      await this.$router.replace("/admin/login");
    },
  },

  directives: { ClickOutside },
  mounted() {
    const { userName } = JSON.parse(localStorage.getItem("adminToken")!);
    this.adminName = userName;
    window.addEventListener('storage',  async function(event){
      if (event.key == "app-logout") {
        this.location.reload();
      }
    }, false);
  },
});
</script>

<style scoped>
.icon {
  color: #ea4c89;
  font-size: 52px;
  cursor: pointer;
  user-select: none;
}
.icon-button {
  display: flex;
  align-items: center;
}
.dropdown-content {
  position: absolute;
  margin-top: 220px;
  right: 25px;
  border-radius: 30px;
  z-index: 100;
  background-color: white;
  box-shadow: -4px 10px 38px -4px rgba(0, 0, 0, 0.46);
  min-width: 200px;
  padding: 10px;
  display: flex;
  flex-direction: column;
}
.signout-button {
  background-color: #ea4c89;
  font-weight: bold;
  color: white;
  border: 0;
  border-radius: 30px;
  padding: 10px;
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
  background-color: #ea4c89;
}
.side-nav-link:hover i {
  text-decoration: none;
  color: #fff;
}
.side-nav-link:hover span {
  color: #fff;
}
.selected {
  color: #ea4c89;
}
</style>
