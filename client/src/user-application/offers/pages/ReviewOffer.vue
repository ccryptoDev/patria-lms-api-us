<template>
  <Layout v-if="selectedOffer" :steps="true" :login="true">
    <div id="review-application">
      <div class="container">
        <div class="row justify-content-center" style="margin-bottom: 36px">
          <div class="col-md-6 col-sm-12">
            <div class="page-main-title">Review Your Application</div>
          </div>
        </div>

        <hr />

        <div class="summary-section">
          <div class="summary-row large-padding">
            <div class="summary-title">Loan Information</div>
            <div class="summary-action">
              <!-- <a class="changeOffer" @click.prevent="changeOffer"
                >Change Offer</a
              > -->
              <router-link to="/offers" class="changeOffer"
                >Change Offer</router-link
              >
            </div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">Requested Amount</div>
            <div class="summary-value">{{ requestedAmount | currency }}</div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">Approved up to</div>
            <div class="summary-value">{{ approvedUpTo | currency }}</div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">Reference Number</div>
            <div class="summary-value">{{ referenceNumber }}</div>
          </div>
        </div>

        <hr />

        <div class="summary-section">
          <div class="summary-row large-padding">
            <div class="summary-title">Applicant Information</div>
            <div class="summary-action"></div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">Name</div>
            <div class="summary-value">{{ firstName }} {{ lastName }}</div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">Address</div>
            <div class="summary-value">
              {{ address }} {{ city }} {{ state }} {{ zip }}
            </div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">Social Sec Number</div>
            <div class="summary-value">
              {{ ssn.slice(0, 3) }}-{{ ssn.slice(3, 5) }}-{{ ssn.slice(5) }}
            </div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">Phone</div>
            <div class="summary-value">{{ phones[0].phone | phone }}</div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">Email</div>
            <div class="summary-value">{{ email }}</div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">Language</div>
            <div class="summary-value">English</div>
          </div>
          <div class="summary-row large-padding">
            <div class="summary-key width-40">Gross Annual Income</div>
            <div class="summary-value">{{ annualIncome | currency }}</div>
          </div>
        </div>

        <hr />
        <div class="custom-control custom-checkbox check-agreement">
          <div class="summary-section">
            <div class="summary-row large-padding" style="padding-left: 26%;">
              <input
                type="checkbox"
                class="custom-control-input"
                id="allowCreditReportPull"
                v-model="allowCreditReportPull"
                value="1"
                @click="!allowCreditReportPull"
              />
              <label class="custom-control-label" for="allowCreditReportPull">
                I authorize the lender, and its representatives, successors and
                assigns to investigate my credit worthiness and obtain a credit
                report for me for any lawful purpose, including, but not limited
                to any extension of credit, renewal, servicing and collections.
              </label>
            </div>
          </div>
        </div>

        <hr />
        <br />
        <br />
        <div class="review-application-buttons mb-5">
          <!-- <a @click.prevent="contract()"> -->
          <button
            type="button"
            class="btn btn-primary btn-lg submit-form-lg"
            :disabled="!allowCreditReportPull"
            @click.prevent="onSubmit"
          >
            SUBMIT
          </button>
          <!-- </a> -->
        </div>
        <br />
        <br />
      </div>
    </div>
  </Layout>
</template>
<script lang="ts">
import Vue from "vue";
import { mapMutations } from "vuex";

import Layout from "@/user-application/layout/pages/Layout.vue";
import { getApplicationData } from "@/user-application/application/api";
import showErrorToast from "@/helpers/errorToast";
import IOffer from "../types/IOffer";

export default Vue.extend({
  components: {
    Layout,
  },

  data() {
    return {
      address: null as null | string,
      allowCreditReportPull: false,
      annualIncome: null as null | number,
      approvedUpTo: null as null | number,
      city: null as null | string,
      email: null as null | string,
      firstName: null as null | string,
      lastName: null as null | string,
      phones: [] as {
        phone: string;
        type: "mobile" | "home" | "office";
      }[],
      referenceNumber: null as null | string,
      requestedAmount: null as null | number,
      selectedOffer: null as null | IOffer,
      ssn: null as null | string,
      state: null as null | string,
      zip: null as null | string,
    };
  },

  methods: {
    ...mapMutations(["setStep"]),
    async onSubmit() {
      await this.$router.push("/sign-contract");
    },
  },

  async created() {
    try {
      const { data } = await getApplicationData();
      const {
        address,
        annualIncome,
        approvedUpTo,
        city,
        email,
        firstName,
        isCompleted,
        lastName,
        lastStep,
        phones,
        referenceNumber,
        requestedAmount,
        selectedOffer,
        ssn,
        state,
        zip,
      } = data;

      if (isCompleted) {
        await this.$router.push({ name: "userDashboard" });
      } else if (!selectedOffer) {
        await this.$router.push({ name: "offers" });
      } else if (selectedOffer && lastStep !== "offers") {
        await this.$router.push({ name: lastStep });
      } else {
        this.setStep(3);

        this.address = address;
        this.annualIncome = annualIncome;
        this.approvedUpTo = approvedUpTo;
        this.city = city;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phones = phones;
        this.referenceNumber = referenceNumber;
        this.requestedAmount = requestedAmount;
        this.selectedOffer = selectedOffer;
        this.ssn = ssn;
        this.state = state;
        this.zip = zip;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        await this.$router.push({ name: "userLogin" });
      } else {
        showErrorToast(this, "error", error.message);
      }
    }
  },
});
</script>
