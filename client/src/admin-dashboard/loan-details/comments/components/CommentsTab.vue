<template>
  <div>
    <h3 style="margin: 10px 0 10px 10px; font-weight: bold;">
      Comments Section
    </h3>
    <ValidationObserver ref="observer" v-slot="{ handleSubmit }">
      <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
        <table class="table table-bordered">
          <tbody>
            <tr>
              <th>Subject</th>
              <td>
                <ValidationProvider
                  name="Subject"
                  :rules="{ required: true }"
                  v-slot="validationContext"
                >
                  <b-form-group>
                    <b-form-input
                      v-model="subject"
                      :state="getValidationState(validationContext)"
                    ></b-form-input>
                    <b-form-invalid-feedback>{{
                      validationContext.errors[0]
                    }}</b-form-invalid-feedback>
                  </b-form-group>
                </ValidationProvider>
              </td>
            </tr>
            <tr>
              <th>Comment</th>
              <td>
                <ValidationProvider
                  name="Comment"
                  :rules="{ required: true }"
                  v-slot="validationContext"
                >
                  <b-form-textarea
                    v-model="comment"
                    rows="4"
                    :state="getValidationState(validationContext)"
                  ></b-form-textarea>

                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
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

    <CommentsTable :screenTrackingId="screenTrackingId" ref="commentsTable" />
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import CommentsTable from "@/admin-dashboard/loan-details/comments/components/CommentsDetailsTable.vue";
import showErrorToast from "@/helpers/errorToast";
import { adminDashboardRequests } from "@/api/admin-dashboard";

export default Vue.extend({
  components: {
    CommentsTable,
  },

  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },

  data() {
    return {
      comment: null as null | string,
      isSubmitting: false,
      subject: null as null | string,
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
    cleanState() {
      this.subject = null;
      this.comment = null;

      this.$nextTick(() => {
        (this.$refs.observer as any).reset();
      });
    },
    async onSubmit() {
      try {
        this.isSubmitting = true;
        const requestBody = {
          subject: this.subject || "",
          comment: this.comment || "",
        };
        await adminDashboardRequests.addComment(
          this.screenTrackingId,
          requestBody
        );

        // reload comments table
        await (this.$refs.commentsTable as any).fetchTable({
          status: "",
          page: 1,
          perPage: 25,
        });

        this.cleanState();
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

<style scoped></style>
