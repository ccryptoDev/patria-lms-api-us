<template>
  <div style="text-align:left; justify-content: space-between; align-items: center; margin: 8px 0px;">
    <button class="primary" style="margin-left: 10px; background-color: #ea4c89; color: white;" @click="promiseToPay">
      {{ stateString }}
    </button>
    <VueFinalModal
      v-model="modal"
      classes="share-modal-container"
      content-class="share-modal-content"
      :clickToClose="false"
    >
      <div v-if="modal">
        <h3>Promise to pay</h3>
        <h5>Are you sure you want to save this promise to pay <br>${{ amountValue }} on {{ dateValue }} at {{ timeValue }}?</h5>
       
        <div class="container" style="width: 35vw;">
          <b-form>
            <div class="row" style="margin-top: 15px;">
                <ValidationProvider
                  name="Explanation"
                  :rules="{ required: false }"
                  v-slot="validationContext"
                >
                  <b-form-textarea
                    id="description"
                    v-model="description"
                    rows="4"
                  ></b-form-textarea>

                  <b-form-invalid-feedback>{{
                    validationContext.errors[0]
                  }}</b-form-invalid-feedback>
                </ValidationProvider>
            </div>
            <div class="row" style="margin-top: 15px;">
              <button
                class="secondary"
                type="button"
                @click="onCancel"
                style="margin-right: 10px;"
              >
                Cancel
              </button>
              <button
                class="secondary"
                type="button"
                @click="onAssign"
                style="margin-left: 10px;"
              >
                Promise to pay
              </button>
            </div>
          </b-form>
        </div>
      </div>
    </VueFinalModal>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import { adminDashboardRequests } from "@/api/admin-dashboard";

export default Vue.extend({
  components: {
    //Datepicker,
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
    amountValue: {
      required: true,
      type: Number,
    },
    idValue: {
      required: true,
      type: String,
    },
    stateString: {
      required: true,
      type: String,
    }
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
      description: "",
      isLoading: false,
    };
  },

  computed: {

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
    onCancel() {
      this.isLoading = false;
      this.modal = false;
    },

    async onAssign() {
      try{
        await adminDashboardRequests.promisetoPay({
          paymentId: this.idValue,
          isRemovingSchedule: false,
          promiseScheduleDate: this.dateValue,
          promiseScheduleTime: this.timeValue,
          promiseDescription: this.description,
          promisedPayAmount: this.amountValue,
          promiseScheduleStatus: "Added",
          customerContacted: false,
        });
        this.$swal({
          title: `Alert`,
          text: "Promise to Pay Updated",
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
          text: "Promise to Pay Unsuccessful",
          icon: "info",
          confirmButtonText: `Ok`,
        }).then(async (result) => {
          if(result.isConfirmed){
            this.modal = false;
          }
        });
      }
    },
    async promiseToPay() {
        if(this.amountValue != null && this.dateValue != null && this.timeValue != null ){
            this.modal = true;
        }else{
            await this.$swal({
        title: "Alert",
        text: `Enter valid amount with date and time`,
        icon: "error",
      });
        }
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
  padding: 10px;
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

</style>

