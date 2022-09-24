<template>
  <div>
    <div v-if="userConsents">
      <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
        Financing Agreement Documents
      </h3>
      <table class="table table-bordered" style="border: none">
        <tbody>
          <tr>
            <th>#</th>
            <th>Document Type</th>
            <th v-if="userData.role !== adminRoles.UserServicing">PDF</th>
            <th v-if="userData.role === adminRoles.UserServicing">
              Uploaded Date
            </th>
          </tr>
          <tr v-for="(consent, index) in userConsents" :key="consent._id">
            <td>{{ index + 1 }}</td>
            <td v-if="
              consent.documentName ==
              'Electronic Funds Transfer Authorization'
            ">
              {{ consent.documentName }}
            </td>
            <td v-else>{{ consent.documentName }}</td>
            <td v-if="userData.role !== adminRoles.UserServicing">
              <a :href="consent.agreementDocumentPath" target="_blank" style="display: block;">View Document</a>
            </td>
            <td v-if="userData.role === adminRoles.UserServicing">
              {{ consent.createdAt }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
      Uploaded Documents
    </h3>
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)" id="desc">
        <table class="table table-bordered" style="border: none">
          <tbody>
            <div id="docuCheck" style="display:none;">
              <p>Please select</p>
            </div>
            <tr>
              <th>Document Type</th>
              <td>
                <ValidationProvider name="Document Type" :rules="{ required: true }" v-slot="validationContext">
                  <b-form-group>
                    <b-form-select v-model="selectedDocumentType" :state="getValidationState(validationContext)"
                      :options="documentTypes" class="form-control">
                    </b-form-select>
                    <b-form-invalid-feedback>{{
                        validationContext.errors[0]
                    }}</b-form-invalid-feedback>
                  </b-form-group>
                </ValidationProvider>
              </td>
            </tr>

            <tr v-if="selectedDocumentType">
              <th>Document</th>
              <!-- <td v-if="selectedDocumentType === 'other'">
   
              </td> -->

              <td>
                <div>
                  <div class="flex flex-column" style="margin-bottom: 10px;">
                    <Label v-if="selectedDocumentType === 'driversLicense'" style="font-weight: bold;">Front</Label>
                    <ValidationProvider name="File Front" :rules="{ required: true }" v-slot="validationContext">
                      <b-form-group>
                        <b-form-file v-model="fileFront" placeholder="Choose a file or drop it here"
                          :state="getValidationState(validationContext)" drop-placeholder="Drop file here"
                          accept=".jpg, .png, .pdf" @change="onFileFrontSelected">
                        </b-form-file>
                        <b-form-invalid-feedback>{{
                            validationContext.errors[0]
                        }}</b-form-invalid-feedback>
                      </b-form-group>
                    </ValidationProvider>
                  </div>
                  <div v-if="selectedDocumentType === 'driversLicense'" class="flex flex-column">
                    <Label style="font-weight: bold;">Back</Label>
                    <ValidationProvider name="File Back" :rules="{ required: true }" v-slot="validationContext">
                      <b-form-group>
                        <b-form-file v-model="fileBack" placeholder="Choose a file or drop it here"
                          :state="getValidationState(validationContext)" drop-placeholder="Drop file here"
                          accept=".jpg, .png, .pdf" @change="onFileBackSelected">
                        </b-form-file>
                        <b-form-invalid-feedback>{{
                            validationContext.errors[0]
                        }}</b-form-invalid-feedback>
                      </b-form-group>
                    </ValidationProvider>
                  </div>

                  <div v-if="selectedDocumentType === 'other'" style="margin-bottom: 10px;">
                    <Label style="font-weight: bold;">Document Title</Label>
                    <ValidationProvider name="File Front" :rules="{ required: true }" v-slot="validationContext">
                      <b-form-group>
                        <b-form-input type="text" class="form-control w-100" size="sm" v-model="otherDocTitle"
                          @change="onOtherDocTitleChange" />
                        <b-form-invalid-feedback>{{
                            validationContext.errors[0]
                        }}</b-form-invalid-feedback>
                      </b-form-group>
                    </ValidationProvider>
                  </div>
                </div>
              </td>
            </tr>
            <tr>
              <td colspan="2" align="center">
                <button :disabled="isLoading" type="submit" class="btn btn-primary"
                  style="font-weight: bold; text-align: center; border-radius: 15px;" id="updocs">
                  <span>Submit</span>
                  <b-spinner small v-show="isLoading"></b-spinner>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </b-form>
    </ValidationObserver>
    <table v-if="userDocuments.length > 0" class="table table-bordered" style="border: none">
      <tbody>
        <tr>
          <th>#</th>
          <th>Document Type</th>
          <th>Document</th>
          <th>Uploaded By</th>
          <th>Uploaded date</th>
        </tr>
        <tr v-for="(document, index) in userDocuments" :key="document._id">
          <td>{{ index + 1 }}</td>
          <td v-if="document && document.passport">Passport</td>
          <td v-if="document && document.driversLicense">Driver's License</td>
          <td v-if="document && document.paystub">Pay Stub</td>
          <td v-if="document && document.proofOfResidence">Proof of Residence</td>
          <td v-if="document && document.otherDoc">{{ document.otherDocTitle | 'Other Document' }}</td>

          <td v-if="document.passport">
            <a :href="document.passport" target="_blank">View Document</a>
          </td>
          <td v-if="document.paystub">
            <a :href="document.paystub" target="_blank">View Document</a>
          </td>
          <td v-if="document.proofOfResidence">
            <a :href="document.proofOfResidence" target="_blank">View Document</a>
          </td>
          <td v-if="document.otherDoc">
            <a :href="document.otherDoc" target="_blank">View Document</a>
          </td>
          <td v-if="document.driversLicense">
            <a :href="document.driversLicense.front" target="_blank" style="display: block;">View Front</a>
            <a :href="document.driversLicense.back" target="_blank" style="display: block;">View Back</a>
          </td>
          <td>{{ document.uploaderName }}</td>
          <td>{{ document.createdAt | timestamp }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { adminDashboardRequests } from "@/api/admin-dashboard";
import { errorHandler } from "@/api/error-handler";
import { getUserData } from "@/admin-dashboard/authentication/helpers";
import { isCardExpired, getAdminRoles } from "@/admin-dashboard/helpers";

export default Vue.extend({
  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },

  data() {
    return {
      selectedDocumentType: null,
      documentTypes: [
        {
          value: null,
          text: "Select Document Type",
        },
        {
          value: "driversLicense",
          text: "Driver's License or ID",
        },
        {
          value: "passport",
          text: "Passport",
        },
        {
          value: "paystub",
          text: "Pay Stub",
        },
        {
          value: "proofOfResidence",
          text: "Proof of Residence",
        },
        {
          value: "other",
          text: "Others",
        },
      ],
      fileFront: null as null | File,
      fileFrontBase64: null as null | string,
      fileFrontName: null as null | string,
      fileBack: null as null | File,
      fileBackBase64: null as null | string,
      fileBackName: null as null | string,
      otherDoc: null as null | string,
      otherDocTitle: null as null | string,
      isLoading: false,
      userDocuments: [],
      userConsents: [],
      userData: getUserData(),
      adminRoles: getAdminRoles(),
    };
  },

  // computed: {
  //   documentDate(date) {
  //     var updateDate = new Date(date);
  //     return (
  //       (updateDate.getMonth() > 8
  //         ? updateDate.getMonth() + 1
  //         : '0' + (updateDate.getMonth() + 1)) +
  //       '/' +
  //       (updateDate.getDate() > 9
  //         ? updateDate.getDate()
  //         : '0' + updateDate.getDate()) +
  //       '/' +
  //       updateDate.getFullYear()
  //     );
  //   },
  // },

  methods: {
    onOtherDocTitleChange(e: any) {
      const value = e.target.value;
      this.otherDocTitle = value;
    },

    getValidationState({ validated, valid = null }: any) {
      return validated ? valid : null;
    },
    onFileFrontSelected(event: any) {
      const selectedImage =
        event.dataTransfer?.files[0] || event.target?.files[0];
      this.fileFrontName =
        event.dataTransfer?.files[0].name || event.target?.files[0].name;
      const reader = new FileReader();
      reader.onload = (event) => {
        this.fileFrontBase64 = (event.target?.result as string).split(
          "base64,"
        )[1];
      };
      reader.readAsDataURL(selectedImage);
    },
    onFileBackSelected(event: any) {
      const selectedImage =
        event.dataTransfer?.files[0] || event.target?.files[0];
      this.fileBackName =
        event.dataTransfer?.files[0].name || event.target?.files[0].name;
      const reader = new FileReader();
      reader.onload = (event) => {
        this.fileBackBase64 = (event.target?.result as string).split(
          "base64,"
        )[1];
      };
      reader.readAsDataURL(selectedImage);
    },
    async loadUserDocuments() {
      try {
        const { data } = await adminDashboardRequests.getUserDocuments(
          this.screenTrackingId
        );
        this.userDocuments = data;
      } catch (error) {
        if (error.response.status === 404) {
          return;
        }

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
    cleanState() {
      this.selectedDocumentType = null;
      this.fileFront = null;
      this.fileFrontBase64 = null;
      this.fileFrontName = null;
      this.fileBack = null;
      this.fileBackBase64 = null;
      this.fileBackName = null;

      this.$nextTick(() => {
        (this.$refs.observer as any).reset();
      });
    },
    async onSubmit() {
      this.isLoading = true;
      const requestBody: any = {};
      if (this.selectedDocumentType === "passport") {
        requestBody.documentType = "passport";
        requestBody.passport = this.fileFrontBase64;
      } else if (this.selectedDocumentType === "driversLicense") {
        requestBody.documentType = "drivers license";
        requestBody.driversLicenseFront = this.fileFrontBase64;
        requestBody.driversLicenseBack = this.fileBackBase64;
      } else if (this.selectedDocumentType === "other") {
        requestBody.documentType = 'otherDoc'
        requestBody.otherDocTitle = this.otherDocTitle;
        this.$set(requestBody, 'otherDoc', this.fileFrontBase64)
      } else {
        requestBody.documentType = this.selectedDocumentType;
        this.$set(requestBody, requestBody.documentType, this.fileFrontBase64)
        // requestBody = this.fileFrontBase64;
      }

      try {
        await adminDashboardRequests.uploadDocument(
          this.screenTrackingId,
          requestBody
        );

        this.cleanState();
        this.isLoading = false;
        await this.$swal({
          title: "Success!",
          text: "Document(s) uploaded successfully.",
          icon: "success",
        });

        await this.loadUserDocuments();
      } catch (error) {
        const errorMessage = await errorHandler(error, this.$router);
        if (errorMessage) {
          await this.$swal({
            title: "Error",
            text: `${errorMessage}`,
            icon: "error",
          });
        }
        this.isLoading = false;
      }
    },
  },

  async mounted() {
    try {
      const result = await Promise.all([
        this.loadUserDocuments(),
        adminDashboardRequests.getUserConsents(this.screenTrackingId),
      ]);
      console.log("result ============", result);
      this.userConsents = result[1].data;
      let i = 0;
      for (const x in this.userConsents) {
        const resp: any = this.userConsents[i];
        const DateObj = new Date(resp.createdAt);
        const dates = DateObj.getDate();
        const months = DateObj.getMonth();
        const years = DateObj.getFullYear();
        resp.createdAt = `${months}/${dates}/${years}`;
        i++;
      }
    } catch (error) {
      if (error.response.status === 404) {
        return;
      }

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

  // documentDate(date) {
  //   console.log('Date: ', date);
  //   const updateDate = new Date(date);
  //   return (
  //     (updateDate.getMonth() > 8
  //       ? updateDate.getMonth() + 1
  //       : '0' + (updateDate.getMonth() + 1)) +
  //     '/' +
  //     (updateDate.getDate() > 9
  //       ? updateDate.getDate()
  //       : '0' + updateDate.getDate()) +
  //     '/' +
  //     updateDate.getFullYear()
  //   );
  // },
});
</script>
