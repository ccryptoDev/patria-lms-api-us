<template>
  <div class="cardForm shadow">
    <table style="margin:20px;">
        <tbody>
            <!-- <tr>
                <th>
                    <strong>Property</strong>
                </th>
                <td>
                    <strong>Value</strong>
                </td>
            </tr> -->
            <tr>
                <th>Late Fee</th>
                <td>
                {{ lateFee | currency}}
                </td>
            </tr>
            <tr>
                <th>NSF Fee</th>
                <td>
                {{ nsfFee | currency}}
                </td>
            </tr>
            <tr>
                <th>Late Fee Grace Period</th>
                <td>
                {{ lateFeeGracePeriod }} Days
                </td>
            </tr>
            <tr>
                <th>Delinquency Time Frame</th>
                <td>
                {{ delinquencyPeriod }} Days
                </td>
            </tr>
             <!-- <tr>
                <th>Events URL</th>
                <td>
                {{ eventsUrl }}
                </td>
            </tr>
            <tr>
                <th>Events Auth Token</th>
                <td>
                {{ eventsAuthToken }}
                </td>
            </tr> -->
        </tbody>
    </table>
    <button @click='modal=true' type="submit" class="primary" style="margin-left: 10px;">
      <span>Update Settings</span>
    </button>
    <VueFinalModal
      v-model="modal"
      classes="share-modal-container"
      content-class="share-modal-content"
      :clickToClose="false"
    >
      <ValidationObserver ref="observer">
        <b-form>
          <div >
            <h5 class="cardDetails">Loan Settings Details</h5>

            <b-form-row>
              <b-col md="12">
                <ValidationProvider
                  name="Late Fee"
                  :rules="{ required: true }"
                  v-slot="validationContext"
                >
                  <b-form-group label="Late Fee" label-for="lateFee">
                    <b-form-input
                      id="lateFee"
                      v-model="updateLateFee"
                      v-mask="feeMask"
                      placeholder="Late Fee"
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
                  name="NSF Fee"
                  :rules="{ required: true }"
                  v-slot="validationContext"
                >
                  <b-form-group label="NSF Fee" label-for="nsfFee">
                    <b-form-input
                      id="nsfFee"
                      v-model="updateNsfFee"
                      v-mask="feeMask"
                      placeholder="NSF Fee"
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
                  name="Late Fee Grace Period"
                  :rules="{ required: true }"
                  v-slot="validationContext"
                >
                  <b-form-group label="Late Fee Grace Period" label-for="lateFeeGracePeriod">
                    <b-form-input
                      id="lateFeeGracePeriod"
                      v-model="updateLateFeeGracePeriod"
                      v-mask="dayMask"
                      placeholder="Late Fee Grace Period"
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
                  name="Delinquency Period"
                  :rules="{ required: true }"
                  v-slot="validationContext"
                >
                  <b-form-group label="Delinquency Period" label-for="delinquencyPeriod">
                    <b-form-input
                      id="delinquencyPeriod"
                      v-model="updateDelinquencyPeriod"
                      v-mask="dayMask"
                      placeholder="Delinquency Period"
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
                  name="Events URL"
                  :rules="{ required: true }"
                  v-slot="validationContext"
                >
                  <b-form-group label="Events URL" label-for="EventsUrl">
                    <b-form-input
                      id="eventsUrl"
                      v-model="updateEventsUrl"
                      placeholder="Events URL"
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
                  name="Events Auth Token"
                  :rules="{ required: true }"
                  v-slot="validationContext"
                >
                  <b-form-group label="Events Auth Token" label-for="eventsAuthToken">
                    <b-form-input
                      id="eventsAuthToken"
                      v-model="updateEventsAuthToken"
                      placeholder="Events Auth Token"
                    ></b-form-input>
                    <b-form-invalid-feedback>{{
                      validationContext.errors[0]
                    }}</b-form-invalid-feedback>
                  </b-form-group>
                </ValidationProvider>
              </b-col>
            </b-form-row>

            <div class="row">
              <button @click="hideModal">Cancel</button>
              <button @click="saveLoanSettings" type="submit" class="primary" style="margin-left: 10px;" :disabled="isLoading">
                <span>Update Settings</span>
                <b-spinner small v-show="isLoading"></b-spinner>
              </button>
            </div>
          </div>
        </b-form>
      </ValidationObserver>
    </VueFinalModal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { adminDashboardRequests } from "@/api/admin-dashboard";
import { errorHandler } from "@/api/error-handler";
import { getAdminRoles } from "@/admin-dashboard/helpers";
import { getUserData } from "@/admin-dashboard/authentication/helpers";
import createNumberMask from "text-mask-addons/dist/createNumberMask";

const feeMask = createNumberMask({
  prefix: "$",
  allowDecimal: true,
  includeThousandsSeparator: true,
  allowNegative: false,
  integerLimit: 7,
});

const dayMask = createNumberMask({
  prefix: "",
  allowDecimal: false,
  includeThousandsSeparator: false,
  allowNegative: false,
  integerLimit: 3,
});

export default Vue.extend({
  props: {
  },

  data() {
    return {
      feeMask,
      dayMask,
      lateFee: null as null | string,
      nsfFee: null as null | string,
      lateFeeGracePeriod: null as null | string,
      delinquencyPeriod: null as null | string,
      eventsUrl: null as null | string,
      eventsAuthToken: null as null | string,
      updateLateFee: null as null | string,
      updateNsfFee: null as null | string,
      updateLateFeeGracePeriod: null as null | string,
      updateDelinquencyPeriod: null as null | string,
      updateEventsUrl: null as null | string,
      updateEventsAuthToken: null as null | string,
      isLoading: false,
      modal: false,
      userData: getUserData(),
      adminRoles: getAdminRoles(),
    };
  },

  computed: {
  },
  methods: {
    hideModal(e: any) {
      this.modal = false;
    },
    async saveLoanSettings() {
      try {
        const requestParams = {
          lateFee: parseFloat(parseFloat((this.updateLateFee || '').replace(/[$,]/g, "")).toFixed(2)),
          nsfFee: parseFloat(parseFloat((this.updateNsfFee || '').replace(/[$,]/g, "")).toFixed(2)),
          lateFeeGracePeriod: parseInt(this.updateLateFeeGracePeriod || ''),
          delinquencyPeriod: parseInt(this.updateDelinquencyPeriod || ''),
          eventsUrl: this.updateEventsUrl,
          eventsAuthToken: this.updateEventsAuthToken,
        };

        this.isLoading = true;
        const {data: UpdatedLoanSettings} = await adminDashboardRequests.updateLoanSettings(requestParams);
        this.lateFee = UpdatedLoanSettings.lateFee;
        this.nsfFee = UpdatedLoanSettings.nsfFee;
        this.lateFeeGracePeriod = UpdatedLoanSettings.lateFeeGracePeriod;
        this.delinquencyPeriod = UpdatedLoanSettings.delinquencyPeriod;
        this.eventsUrl = UpdatedLoanSettings.eventsUrl;
        this.eventsAuthToken = UpdatedLoanSettings.eventsAuthToken;
        this.isLoading = false;
        this.modal = false;
        await this.$swal({
          title: "Success!",
          text: "Loan Settings Updated",
          icon: "success",
        });
      } catch (error) {
        const errorMessage = await errorHandler(error, this.$router);
        this.isLoading = false;
        if (errorMessage) {
          await this.$swal({
            title: "Error",
            text: `${errorMessage}`,
            icon: "error",
          });
        }
      }
    },
  },
  async created() {
    try {
        const {
            data: LoanSettings,
        } = await adminDashboardRequests.getLoanSettings();

        this.lateFee = LoanSettings.lateFee;
        this.nsfFee = LoanSettings.nsfFee;
        this.lateFeeGracePeriod = LoanSettings.lateFeeGracePeriod;
        this.delinquencyPeriod = LoanSettings.delinquencyPeriod;
        this.eventsUrl = LoanSettings.eventsUrl;
        this.eventsAuthToken = LoanSettings.eventsAuthToken;
        this.updateEventsUrl = LoanSettings.eventsUrl;
        this.updateEventsAuthToken = LoanSettings.eventsAuthToken;
        this.updateLateFee = LoanSettings.lateFee;
        this.updateNsfFee = LoanSettings.nsfFee;
        this.updateLateFeeGracePeriod = LoanSettings.lateFeeGracePeriod;
        this.updateDelinquencyPeriod = LoanSettings.delinquencyPeriod;
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
table {
  width: 100%;
  border: 1px solid #f4f4f4;
}
td {
  border: 1px solid #f4f4f4;
  padding: 10px;
}
tr > :first-child {
  font-weight: bold;
}
</style>
