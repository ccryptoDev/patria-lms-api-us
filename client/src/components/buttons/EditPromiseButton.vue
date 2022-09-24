<template>
  <div style="margin: 3px; justify-content: space-between; align-items: center;">
    <div style="text-align: left" @click="onEditPromise">
      <button class="primary" style="margin-right: 0px;">Edit</button>
    </div>
    <VueFinalModal
      v-model="modal"
      classes="share-modal-container"
      content-class="share-modal-content"
      :clickToClose="false"
    >
      <div v-if="modal">

        <b-form @submit.stop.prevent="handleSubmit(onSubmit)">
        <div class="cardForm" style="margin: 8px 0px;">
          <h5 class="cardDetails">Promise To Pay</h5>

          <b-form-row>
            <b-col md="6">
              <ValidationProvider
                name="Open Date"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Select Date" label-for="openDate">
                  <Datepicker
                    id="openDate"
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
                name="State"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Select Time" label-for="state">
                  <b-form-select
                    id="state"
                    v-model="selectedState"
                    :options="timeValues"
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
                name="Promised Payment Amount"
                :rules="{ required: true }"
                v-slot="validationContext"
              >
                <b-form-group label="Promised Payment Amount" label-for="zip">
                  <b-form-input
                    id="amount"
                    v-model="amount"
                    placeholder=""
                    v-mask="'#####'"
                  ></b-form-input>
                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </b-form-group>
              </ValidationProvider>
            </b-col>
          </b-form-row>

          <div class="row"> 
            <button type="submit" class="" style="margin-left: 10px;" @click="onCancel">
              <span>Cancel</span>
              <b-spinner small v-show="isLoading"></b-spinner>
            </button>
            <button type="submit" class="" style="margin-left: 10px;" @click="onEdit">
              <span>Update</span>
              <b-spinner small v-show="isLoading"></b-spinner>
            </button>
          </div>
        </div>
      </b-form>
      </div>
    </VueFinalModal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import moment from "moment";
import Datepicker from "vuejs-datepicker";
import selecttime from "@/helpers/selecttime";
import { adminDashboardRequests } from "@/api/admin-dashboard";

export default Vue.extend({
  components: {
    Datepicker,
  },

   props: {
    dateValue: {
      required: true,
      type: String,
    },
    timeValue: {
      required: true,
      type: String,
    },
    scheduleValue: {
      required: true,
      type: String,
    },
    amountValue: {
      required: true,
      type: Number,
    },
    idValue: {
      required: true,
      type: String,
    },
  },

  data() {
    return {
      modal: false,
      adminUsers: [] as {
        email: string;
        role: string;
        id: string;
      }[],
      selectedCard: "",
      isLoading: false,
      openDate: this.dateValue,
      selectedState: this.timeValue,
      amount: this.amountValue,
      timeSlots: selecttime as { value: string }[],
      disabledDates: {
        to: moment().startOf("day").toDate(),
        from: moment().add(1, "months").startOf("day").toDate(),
      },
    };
  },

  computed: {
      timeValues(): { value: string | null; text: string }[] {
      return this.timeSlots.map((time) => {
        return {
          value: time.value,
          text: time.value,
        };
      });
    },
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
    async onEdit() {
      this.isLoading = false;
      this.modal = false;
        try{
          await adminDashboardRequests.updatePromisetopay({
            paymentId: this.idValue,
            promiseScheduleDate: this.scheduleValue,
            newPromiseDate: moment(
            `${this.openDate} ${this.selectedState}`,
            'MM-DD-YYYY h:mm A',
          ).toLocaleString(),
            promisedPayAmount: this.amount,
          });
          this.$swal({
            title: `Alert`,
            text: "Promise to pay updated",
            icon: "info",
            confirmButtonText: `Ok`,
          }).then(async (result) => {
            if(result.isConfirmed){
                this.modal = false;
                this.$router.go(0);
            }
          });
        }catch(error){
            this.$swal({
            title: `${error}`,
            text: "Promise to pay unsuccessful",
            icon: "info",
            confirmButtonText: `Ok`,
        }).then(async (result) => {
          if(result.isConfirmed){
              this.modal = false;
          }
        });
      }
    },
    async onCancel() {
      this.isLoading = false;
      this.modal = false;
    },
    async onEditPromise() {
      this.modal = true;
    },
    async showPopup(sender: any[]) {
      await this.$swal({
        title: "Error",
        text: `${JSON.stringify(sender)}`,
        icon: "error",
      });
    },
  },

  async mounted() {
    const { data } = await adminDashboardRequests.getAdmin();

   
    
    if (data && data.rows.length > 0) {
      this.adminUsers = data.rows.filter(
        (admin: any) => admin.role == 'Super Admin'
      );
      this.selectedCard = "";
    }
  },
});
</script>

<style scoped>
button {
  font-weight: bold;
  border: 0;
  min-width: 150px;
  border-radius: 30px;
  padding: 5px;
}
button:focus {
  outline: none;
}

.primary {
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

.ico {
  display: block;
  height: 32px;
  width: 32px;
  border: 2px solid #fff;
  border-radius: 16px;
  margin: 3px 4px 3px 20px;
}

.text-right {
  text-align: right;
}
.text-left {
  text-align: left;
}

table {
  width: 100%;
  border: 1px solid #000;
}
td {
  border: 1px solid #000;
  padding: 10px;
}
th {
  border: 1px solid #000;
  padding: 10px;
}
tr > :first-child {
  font-weight: bold;
}

.paid {
  background-color: #a1e1e4;
}

.amount-error {
  padding-top: 8px;
  display: block;
  font-size: 0.6rem;
}

.amount-input-error {
  border: 2px solid #dc3545;
}
</style>

