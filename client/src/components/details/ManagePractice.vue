<template>
  <div style="height: 100vh;">
    <div id="preLoader" :class="{ active: isLoading }" class="preLoader">
      <pre>
        <font-awesome-icon icon="circle-notch" spin />
      </pre>
    </div>
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
        <div class="cardForm shadow">
          <h5 class="cardDetails">Practice Details</h5>

          <b-form-row>
            <b-col md="6">
              <ValidationProvider
                name="Address"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Address" label-for="address">
                  <b-form-input
                    id="address"
                    v-model="address"
                    placeholder="Address"
                    :state="getValidationState(validationContext)"
                  ></b-form-input>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>

            <b-col md="6">
              <ValidationProvider
                name="Regional Manager"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group
                  label="Regional Manager"
                  label-for="regionalManager"
                >
                  <b-form-input
                    id="regionalManager"
                    v-model="regionalManager"
                    placeholder="Regional Manager"
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
            <b-col md="6">
              <ValidationProvider
                name="Region"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Region" label-for="region">
                  <b-form-input
                    id="region"
                    v-model="region"
                    placeholder="Region"
                    :state="getValidationState(validationContext)"
                  ></b-form-input>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>

            <b-col md="6">
              <ValidationProvider
                name="Management Region"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group
                  label="Management Region"
                  label-for="managementRegion"
                >
                  <b-form-input
                    id="managementRegion"
                    v-model="managementRegion"
                    placeholder="Management Region"
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
            <b-col md="6">
              <ValidationProvider
                name="City"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="City" label-for="city">
                  <b-form-input
                    id="city"
                    v-model="city"
                    placeholder="City"
                    :state="getValidationState(validationContext)"
                  ></b-form-input>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>

            <b-col md="6">
              <ValidationProvider
                name="State"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="State" label-for="state">
                  <b-form-select
                    id="state"
                    v-model="selectedState"
                    :state="getValidationState(validationContext)"
                    :options="parsedStates"
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

          <b-form-row>
            <b-col md="6">
              <ValidationProvider
                name="Location"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Location" label-for="location">
                  <b-form-input
                    id="location"
                    v-model="location"
                    placeholder="Location"
                    :state="getValidationState(validationContext)"
                  ></b-form-input>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>

            <b-col md="6">
              <ValidationProvider
                name="Zip"
                :rules="{ required: true, min: 5, max: 5 }"
                v-slot="validationContext"
              >
                <b-form-group label="Zip" label-for="zip">
                  <b-form-input
                    id="zip"
                    v-model="zip"
                    placeholder="Zip"
                    v-mask="'#####'"
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
            <b-col md="6">
              <ValidationProvider
                name="Open Date"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Open Date" label-for="openDate">
                  <Datepicker
                    v-model="openDate"
                    :format="'MM/dd/yyyy'"
                    :disabledDates="disabledDates"
                    :input-class="'w-100 form-control'"
                    :state="getValidationState(validationContext)"
                  />
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>
            <b-col md="6">
              <ValidationProvider
                name="Phone Number"
                :rules="{ required: true, min: 14, max: 14 }"
                v-slot="validationContext"
              >
                <b-form-group label="Phone Number" label-for="phoneNumber">
                  <b-form-input
                    id="phoneNumber"
                    v-model="phone"
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

          <div class="row">
            <router-link
              to="/admin/manage-practice"
              class="button"
              style="margin-right: 10px;"
            >
              Go Back
            </router-link>
            <button type="submit" class="" style="margin-left: 10px;">
              <span v-if="practiceManagementId">Update</span>
              <span v-else>Add Practice</span>
              <b-spinner small v-show="isLoading"></b-spinner>
            </button>
          </div>
        </div>
      </b-form>
    </ValidationObserver>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import Datepicker from "vuejs-datepicker";
import moment from "moment";

import { adminDashboardRequests } from "@/api/admin-dashboard";
import { errorHandler } from "@/api/error-handler";
import states from "@/helpers/states";

export default Vue.extend({
  components: {
    Datepicker,
  },

  props: {
    currentAddress: {
      required: false,
      type: String,
    },
    currentCity: {
      required: false,
      type: String,
    },
    currentLocation: {
      required: false,
      type: String,
    },
    currentManagementRegion: {
      required: false,
      type: String,
    },
    currentOpenDate: {
      required: false,
      type: String,
    },
    currentPhone: {
      required: false,
      type: String,
    },
    currentRegion: {
      required: false,
      type: String,
    },
    currentRegionalManager: {
      required: false,
      type: String,
    },
    currentState: {
      required: false,
      type: String,
    },
    currentZip: {
      required: false,
      type: String,
    },
    practiceManagementId: {
      required: false,
      type: String,
    },
  },

  data() {
    return {
      address: null as null | string,
      city: null as null | string,
      disabledDates: {
        to: moment()
          .subtract(100, "years")
          .startOf("day")
          .toDate(),
        from: moment()
          .startOf("day")
          .toDate(),
      },
      isLoading: false,
      location: null as null | string,
      managementRegion: null as null | string,
      openDate: moment()
        .startOf("day")
        .toISOString(),
      phone: null as null | string,
      region: null as null | string,
      regionalManager: null as null | string,
      selectedState: null as null | string,
      states: states as { state: string; stateCode: null | string }[],
      zip: null as null | string,
    };
  },

  computed: {
    parsedPhoneNumber(): string {
      const parsedNumber = this.phone?.replace(/[^0-9]/g, "") ?? "";
      return parsedNumber;
    },
    parsedStates(): { value: string | null; text: string }[] {
      return this.states.map((state) => {
        return {
          value: state.stateCode,
          text: state.state,
        };
      });
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
    async savePractice() {
      try {
        const requestParams = {
          address: this.address || "",
          city: this.city || "",
          isDeleted: false,
          location: this.location || "",
          managementRegion: this.managementRegion || "",
          openDate: this.openDate,
          phone: this.parsedPhoneNumber,
          region: this.region || "",
          regionalManager: this.regionalManager || "",
          stateCode: this.selectedState || "",
          zip: this.zip || "",
        };
        await adminDashboardRequests.addPracticeManagement(requestParams);

        await this.$swal({
          title: "Success!",
          text: "Practice successfully added.",
          icon: "success",
        });
        this.$router.push("/admin/manage-practice");
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
    async updatePractice(practiceManagementId: string) {
      try {
        const requestParams = {
          address: this.address || "",
          city: this.city || "",
          isDeleted: false,
          location: this.location || "",
          managementRegion: this.managementRegion || "",
          openDate: this.openDate,
          phone: this.parsedPhoneNumber,
          region: this.region || "",
          regionalManager: this.regionalManager || "",
          stateCode: this.selectedState || "",
          zip: this.zip || "",
        };
        await adminDashboardRequests.updatePracticeManagementById(
          practiceManagementId,
          requestParams
        );
        await this.$swal({
          title: "Success!",
          text: "Admin successfully added.",
          icon: "success",
        });
        this.$router.push("/admin/manage-practice");
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
      if (this.practiceManagementId) {
        await this.updatePractice(this.practiceManagementId);
      } else {
        await this.savePractice();
      }
    },
  },

  async mounted() {
    const practiceManagementId = this.practiceManagementId;

    if (this.practiceManagementId) {
      this.isLoading = true;
      try {
        const { data } = await adminDashboardRequests.getPracticeManagementById(
          practiceManagementId
        );
        const {
          address,
          city,
          location,
          managementRegion,
          openDate,
          phone,
          region,
          regionalManager,
          stateCode,
          zip,
        } = data;
        this.address = address;
        this.city = city;
        this.location = location;
        this.managementRegion = managementRegion;
        this.openDate = openDate;
        this.phone = phone;
        this.region = region;
        this.regionalManager = regionalManager;
        this.selectedState = stateCode;
        this.zip = zip;

        this.isLoading = false;
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

        this.isLoading = false;
      }
    }
  },
});
</script>

<style scoped>
button:focus {
  outline: none;
}
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
