<template>
  <div>
    <div class="share-button" @click="showShareLink = true">
      <i class="material-icons">share</i
      ><span style="margin-left: 5px; text-align:center;">
        Share App Link
      </span>
    </div>
    <VueFinalModal
      v-model="showShareLink"
      classes="share-modal-container"
      content-class="share-modal-content"
      :clickToClose="false"
    >
      <div style="background-color: white;">
        <h2>Please provide the information below</h2>
        <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
          <b-container>
            <b-form
              autocomplete="off"
              @submit.stop.prevent="handleSubmit(onSubmit)"
            >
              <b-form-row>
                <b-col md="6">
                  <ValidationProvider
                    name="First Name"
                    :rules="{ required: true }"
                    v-slot="validationContext"
                  >
                    <b-form-group
                      label="First Name*"
                      label-for="firstName"
                      label-align="center"
                    >
                      <b-form-input
                        id="firstName"
                        v-model="firstName"
                        :state="getValidationState(validationContext)"
                        @keypress="isLetter($event)"
                      ></b-form-input>

                      <b-form-invalid-feedback>{{
                        validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </b-col>

                <b-col md="6">
                  <ValidationProvider
                    name="Last Name"
                    :rules="{ required: true }"
                    v-slot="validationContext"
                  >
                    <b-form-group
                      label="Last Name*"
                      label-for="lastName"
                      label-align="center"
                    >
                      <b-form-input
                        id="lastName"
                        v-model="lastName"
                        :state="getValidationState(validationContext)"
                        @keypress="isLetter($event)"
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
                    name="Email"
                    :rules="{ required: true, email: true }"
                    v-slot="validationContext"
                  >
                    <b-form-group
                      label="Email*"
                      label-for="email"
                      label-align="center"
                    >
                      <b-form-input
                        id="email"
                        v-model="email"
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
                    name="Phone"
                    :rules="{ required: true, min: 14, max: 14 }"
                    v-slot="validationContext"
                  >
                    <b-form-group
                      label="Phone Number*"
                      label-for="phone"
                      label-align="center"
                    >
                      <b-form-input
                        id="phone"
                        v-mask="'(###) ###-####'"
                        v-model="phone"
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
                    name="Location"
                    :rules="{ required: true }"
                    v-slot="validationContext"
                  >
                    <b-form-group
                      label="Location*"
                      label-for="location"
                      label-align="center"
                    >
                      <b-form-select
                        id="location"
                        v-model="selectedLocation"
                        :state="getValidationState(validationContext)"
                        :options="locations"
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

              <b-row align-v="center">
                <b-col md="12">
                  <b-form-group>
                    <b-form-checkbox-group
                      :options="sendLinkOptions"
                      v-model="selectedSendOptions"
                      @input="onCheckboxInput()"
                    >
                    </b-form-checkbox-group>
                  </b-form-group>
                  <label v-if="sendLinkOptionsError" style="color: #ef5493;">{{
                    sendLinkOptionsError
                  }}</label>
                </b-col>
              </b-row>

              <b-row align-h="center">
                <b-col md="12">
                  <button
                    class="secondary mr-2"
                    type="button"
                    @click="resetForm"
                  >
                    Cancel
                  </button>
                  <button type="submit" class="ml-2" :disabled="isSubmitting">
                    Submit
                  </button>
                </b-col>
              </b-row>
            </b-form>
          </b-container>
        </ValidationObserver>
      </div>
    </VueFinalModal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { adminDashboardRequests } from "@/api/admin-dashboard";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  data() {
    return {
      email: null as null | string,
      firstName: null as null | string,
      isSubmitting: false,
      lastName: null as null | string,
      locations: [] as { text: string; value: string }[],
      phone: null as null | string,
      selectedSendOptions: [] as string[],
      selectedLocation: null as null | string,
      sendLinkOptions: [
        { text: "Send Email", value: "email" },
        { text: "Send SMS", value: "sms" },
      ],
      sendLinkOptionsError: null as null | string,
      showShareLink: false,
    };
  },

  computed: {
    parsedPhoneNumber(): string {
      if (this.phone) {
        return this.phone.replace(/[^0-9]/g, "");
      }

      return "";
    },
  },

  methods: {
    onCheckboxInput() {
      if (this.sendLinkOptionsError) {
        this.sendLinkOptionsError = null;
      }
    },
    isLetter(event: KeyboardEvent) {
      const char = event.key;
      if (!/^[a-zA-Z\s]+$/.test(char)) {
        event.preventDefault();
      }
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
    resetForm() {
      this.email = null;
      this.firstName = null;
      this.lastName = null;
      this.lastName = null;
      this.phone = null;
      this.selectedLocation = null;
      this.showShareLink = false;
      this.selectedSendOptions = [];
      this.sendLinkOptionsError = null;
      this.$nextTick(() => {
        (this.$refs.observer as any).reset();
      });
    },
    async onSubmit() {
      if (this.selectedSendOptions.length <= 0) {
        this.sendLinkOptionsError =
          "At least one option of sending must be checked";
        return;
      }

      try {
        this.isSubmitting = true;
        const requestBody = {
          email: this.email || "",
          firstName: this.firstName || "",
          lastName: this.lastName || "",
          phone: this.parsedPhoneNumber,
          practiceManagement: this.selectedLocation || "",
          sendEmail: this.selectedSendOptions.includes("email"),
          sendSms: this.selectedSendOptions.includes("sms"),
          source: "web" as "web",
        };
        await adminDashboardRequests.sendApplicationLink(requestBody);

        await this.$swal({
          title: "Success!",
          text: "Application Successfully Sent.",
          icon: "success",
        });
        this.resetForm();
        this.isSubmitting = false;
      } catch (error) {
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
    },
  },

  async created() {
    const { data: locationsData } = await adminDashboardRequests.getLocations();
    const mappedLocations = locationsData.map(
      ({ _id, location }: { _id: string; location: string }) => {
        return {
          value: _id,
          text: location,
        };
      }
    );
    this.locations = [
      {
        value: null,
        text: "Select a Location",
      },
      ...mappedLocations,
    ];
  },
});
</script>

<style>
.share-button {
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  color: #ea4c89;
  padding: 7px 8px;
  border-radius: 8px;
  border: 1px solid #ea4c89;
}
.share-button:hover {
  color: white;
  background-color: #ea4c89;
}
.share-modal-container {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.share-modal-content {
  background-color: white;
  border-radius: 30px;
  padding: 20px;
}
button {
  font-weight: bold;
  border: 0;
  min-width: 150px;
  border-radius: 30px;
  padding: 10px;
}
button[type="submit"] {
  background-color: #ea4c89;
  color: white;
}

.secondary {
  background-color: white;
  color: #ea4c89;
  border: 1px solid #ea4c89;
}
.row {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
</style>
