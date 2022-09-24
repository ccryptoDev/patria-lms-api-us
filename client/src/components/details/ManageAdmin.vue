<template v-if="practiceManagements && roles">
  <div>
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
        <div class="cardForm shadow">
          <h5 class="cardDetails">Admin Details</h5>

          <b-form-row>
            <b-col md="12">
              <ValidationProvider
                name="User Name"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="User Name" label-for="userName">
                  <b-form-input
                    id="userName"
                    v-model="userName"
                    placeholder="User Name"
                    :state="getValidationState(validationContext)"
                  ></b-form-input>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>
          </b-form-row>

          <b-form-row>
            <b-col md="12">
              <ValidationProvider
                name="Email"
                :rules="{ required: true, email: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Email" label-for="email">
                  <b-form-input
                    id="email"
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
          </b-form-row>

          <b-form-row>
            <b-col md="12">
              <ValidationProvider
                name="Phone Number"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Phone Number" label-for="phoneNumber">
                  <b-form-input
                    id="phoneNumber"
                    v-model="phoneNumber"
                    placeholder="Phone Number"
                    v-mask="'(###) ###-####'"
                    :state="getValidationState(validationContext)"
                  ></b-form-input>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>
          </b-form-row>

          <b-form-row>
            <b-col md="12">
              <ValidationProvider
                name="Role"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Role" label-for="role">
                  <b-form-select
                    id="role"
                    v-model="selectedRole"
                    :state="getValidationState(validationContext)"
                    :options="roles"
                    class="form-control"
                  >
                  </b-form-select>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>
          </b-form-row>

          <!-- <b-form-row v-if="selectedRole !== 'Admin'">
            <b-col md="12">
              <ValidationProvider
                name="Location"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Location" label-for="location">
                  <b-form-select
                    id="location"
                    v-model="selectedPracticeManagement"
                    :state="getValidationState(validationContext)"
                    :options="practiceManagements"
                    class="form-control"
                  >
                  </b-form-select>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>
          </b-form-row> -->
          <div class="row">
            <router-link
              to="/admin/manage-admin-users"
              class="button"
              style="margin-right: 10px;"
            >
              Go Back
            </router-link>
            <button type="submit" class="primary" style="margin-left: 10px;">
              <span v-if="adminId">Update</span>
              <span v-else>Add Admin</span>
              <b-spinner small v-show="isSubmitting"></b-spinner>
            </button>
          </div>
        </div>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { adminDashboardRequests } from "@/api/admin-dashboard";
import { errorHandler } from "@/api/error-handler";
import { getAdminRoles } from "@/admin-dashboard/helpers";
import { getUserData } from "@/admin-dashboard/authentication/helpers";

export default Vue.extend({
  props: {
    currentEmail: {
      required: false,
      type: String,
    },
    currentPhoneNumber: {
      required: false,
      type: String,
    },
    currentUserName: {
      required: false,
      type: String,
    },
    currentRole: {
      required: false,
      type: String,
    },
    currentLocation: {
      required: false,
      type: String,
    },
    adminId: {
      required: false,
      type: String,
    },
  },

  data() {
    return {
      email: null as null | string,
      isSubmitting: false,
      modal: false,
      phoneNumber: null as null | string,
      practiceManagements: [
        {
          value: null,
          text: "Select a Location",
        },
      ],
      roles: [
        {
          value: null,
          text: "Select the Role",
        },
      ],
      selectedPracticeManagement: null as null | string,
      selectedRole: null as null | string,
      userName: null as null | string,
      userData: getUserData(),
      adminRoles: getAdminRoles(),
    };
  },

  computed: {
    parsedPhoneNumber(): string {
      const parsedNumber = this.phoneNumber?.replace(/[^0-9]/g, "") ?? "";
      return parsedNumber;
    },
  },
  methods: {
    getValidationState({
      dirty,
      validated,
      valid = null,
    }: {
      dirty: boolean;
      validated: boolean;
      valid: null | boolean;
    }) {
      return dirty || validated ? valid : null;
    },
    async saveAdmin() {
      try {
        const requestParams = {
          email: this.email || "",
          phoneNumber: this.parsedPhoneNumber || "",
          practiceManagement: this.selectedPracticeManagement || "",
          role: this.selectedRole || "",
          userName: this.userName || "",
        };
        await adminDashboardRequests.addAdmin(requestParams);

        await this.$swal({
          title: "Success!",
          text: "Admin successfully added.",
          icon: "success",
        });
        this.$router.push("/admin/manage-admin-users");
      } catch (error) {
        const errorMessage = await errorHandler(error, this.$router);
        if (errorMessage) {
          await this.$swal({
            title: "Error",
            text: `${errorMessage}`,
            icon: "error",
          });
        }
      }
    },
    async updateAdmin(adminId: string) {
      try {
        const requestParams = {
          email: this.email || "",
          phoneNumber: this.parsedPhoneNumber || "",
          practiceManagement: this.selectedPracticeManagement || "",
          role: this.selectedRole || "",
          userName: this.userName || "",
        };
        await adminDashboardRequests.updateAdminById(adminId, requestParams);

        const userData = getUserData();

        await this.$swal({
          title: "Success!",
          text: "Admin data successfully edited.",
          icon: "success",
        });
        if (userData && userData.id === adminId) {
          localStorage.clear();
          await this.$router.replace("/admin/login");
        } else {
          await this.$router.push("/admin/manage-admin-users");
        }
      } catch (error) {
        const errorMessage = await errorHandler(error, this.$router);
        if (errorMessage) {
          await this.$swal({
            title: "Error",
            text: `${errorMessage}`,
            icon: "error",
          });
        }
      }
    },
    async onSubmit() {
      if (this.adminId) {
        await this.updateAdmin(this.adminId);
      } else {
        await this.saveAdmin();
      }
    },
  },
  async created() {
    try {
      const {
        data: locationsData,
      } = await adminDashboardRequests.getLocations();
      const mappedPracticeManagements = locationsData.map(
        ({ _id, location }: { _id: string; location: string }) => {
          return {
            value: _id,
            text: location,
          };
        }
      );
      this.practiceManagements = [
        ...this.practiceManagements,
        ...mappedPracticeManagements,
      ];

      const { data: rolesData } = await adminDashboardRequests.getRoles();
      const mappedRoles = rolesData.map(
        ({ roleName }: { roleName: string }) => {
          return {
            value: roleName,
            text: roleName,
          };
        }
      );
      this.roles = [...this.roles, ...mappedRoles];

      // fill fields if updating
      if (this.currentEmail) {
        this.email = this.currentEmail;
      }
      if (this.currentPhoneNumber) {
        this.phoneNumber = this.currentPhoneNumber;
      }
      if (this.currentUserName) {
        this.userName = this.currentUserName;
      }
      if (this.currentRole) {
        this.selectedRole = this.currentRole;
      }
      if (this.currentLocation) {
        this.selectedPracticeManagement = this.currentLocation;
      }
    } catch (error) {
      const errorMessage = await errorHandler(error, this.$router);
      if (errorMessage) {
        await this.$swal({
          title: "Error",
          text: `${errorMessage}`,
          icon: "error",
        });
      }
    }
  },
});
</script>

<style scoped>
.button {
  background-color: white;
  border-radius: 30px;
  border: 1px solid #ea4c89;
  color: #ea4c89;
  font-weight: bold;
  min-width: 150px;
  padding: 10px;
  text-align: center;
}
.button:hover {
  text-decoration: none;
}
</style>
