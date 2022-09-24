<template>
  <div>
    <div>
      <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
        Add Communication History
      </h3>
      <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
        <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
          <table class="table table-bordered">
            <tbody>
              <tr>
                <th>Method</th>
                <td>
                  <b-col md="6">
                    <ValidationProvider name="Method" :rules="{ required: true }" v-slot="validationContext">
                      <b-form-group>
                        <b-form-select v-model="selectedMethod" ref="method"
                          :state="getValidationState(validationContext)" :options="method" class="form-control">
                        </b-form-select>
                        <b-form-invalid-feedback>{{
                            validationContext.errors[0]
                        }}</b-form-invalid-feedback>
                      </b-form-group>
                    </ValidationProvider>
                  </b-col>
                </td>
              </tr>
              <tr>
                <th>Summary</th>
                <td>
                  <ValidationProvider name="Summary" :rules="{ required: true }" v-slot="validationContext">
                    <b-form-textarea v-model="summary" rows="4" :state="getValidationState(validationContext)">
                    </b-form-textarea>

                    <b-form-invalid-feedback>{{
                        validationContext.errors[0]
                    }}</b-form-invalid-feedback>
                  </ValidationProvider>
                </td>
              </tr>
              <tr v-if="selectedMethod === 'Email'">
                <th>Email</th>
                <td>
                  <ValidationProvider name="Email" :rules="{ required: true, email: true }" v-slot="validationContext">
                    <b-form-group>
                      <b-form-input v-model="email" :state="getValidationState(validationContext)"></b-form-input>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </td>
              </tr>
              <tr v-if="selectedMethod === 'Cell phone'">
                <th>Cell phone</th>
                <td>
                  <ValidationProvider name="CellPhone" :rules="{ required: true }" v-slot="validationContext"
                    v-mask="'##########'">
                    <b-form-group>
                      <b-form-input v-model="cellphone" :state="getValidationState(validationContext)"></b-form-input>
                      <b-form-invalid-feedback>{{
                          validationContext.errors[0]
                      }}</b-form-invalid-feedback>
                    </b-form-group>
                  </ValidationProvider>
                </td>
              </tr>
              <tr>
                <th></th>
                <td style="text-align: center;">
                  <button type="submit">Submit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </b-form>
      </ValidationObserver>
    </div>
    <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
      Communication History Details
    </h3>
    <CommunicationTabTable :screenTrackingId="screenTrackingId" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import CommunicationTabTable from "@/admin-dashboard/audit-log/components/CommunicationTabTable.vue";
import { adminDashboardRequests } from "@/api/admin-dashboard";
import showErrorToast from "@/helpers/errorToast";

export default Vue.extend({
  components: {
    CommunicationTabTable,
  },

  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },

  data() {
    return {
      method: ["Email", "Cell phone"],
      selectedMethod: "" as string,
      summary: "" as string,
      email: null as null | string,
      cellphone: null as null | number,
      isSubmitting: false,
    };
  },

  methods: {
    getValidationState({
      validated,
      valid = null,
    }: {
      validated: boolean;
      valid: null | boolean;
    }) {
      return validated ? valid : null;
    },
    // cleanState() {
    //   this.method = ["email", "cell phone"];
    //   this.selectedMethod = null;
    //   this.summary = null;
    //   this.email = null;
    //   this.cellphone = null;

    //   this.$nextTick(() => {
    //     (this.$refs.observer as any).reset();
    //   });
    // },
    async onSubmit() {
      try {
        this.isSubmitting = true;
        const requestBody = {
          date: new Date(),
          method: this.selectedMethod,
          summary: this.summary,
          email: this.email,
          cellPhone: this.cellphone,
        };

        const result = await adminDashboardRequests.addCommunicationHistory(
          this.screenTrackingId,
          requestBody
        );
        // reload comments table
        // await (this.$refs.commentsTable as any).fetchTable({
        //   status: "",
        //   page: 1,
        //   perPage: 25,
        // });

        // this.cleanState();
        showErrorToast(this, "success", "Communication Added Successfully");

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
});
</script>

<style scoped>
</style>
