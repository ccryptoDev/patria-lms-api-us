<template>
  <div style="margin: 3px; justify-content: space-between; align-items: center;">
    <div @click="onRemovePromise">
      <button class="primary" style="margin-right: 0px;">Remove</button>
    </div>
    <VueFinalModal
      v-model="modal"
      classes="share-modal-container"
      content-class="share-modal-content"
      :clickToClose="false"
    >
      <div v-if="modal">
        <h3>Promise to Pay</h3>
        <h5>Are you sure you want to remove this Promise to Pay <br>${{ amountValue }} on {{ dateValue }} at {{ timeValue }} ?</h5>
       
        <div class="container" style="width: 35vw;">
          <b-form>
            <div class="row" style="margin-top: 15px;">
              <button
                class="primary"
                type="button"
                @click="onCancel"
                style="margin-right: 10px;"
              >
                Cancel
              </button>
              <button
                class="primary"
                type="button"
                @click="onAssign"
                style="margin-left: 10px;"
              >
                Remove
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
        await adminDashboardRequests.changeStatusPromisetopay({
          paymentId: this.idValue,
          promiseScheduleDate: this.scheduleValue,
          promiseScheduleStatus: "Removed",
        });
        this.$swal({
          title: `Alert`,
          text: "Promise to Pay Removed",
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
          text: "Promise to Pay Removal Unsuccessful",
          icon: "info",
          confirmButtonText: `Ok`,
        }).then(async (result) => {
          if(result.isConfirmed){
            this.modal = false;
          }
        });
      }
    },
    async onRemovePromise() {
      if(this.amountValue != null && this.dateValue != null && this.timeValue != null ){
          this.modal = true;
      }else{
          await this.$swal({
            title: "Alert",
            text: `An error has occured when removing this Promise to Pay.`,
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
    const { data } = await adminDashboardRequests.getAdmin(
      
    );

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
</style>

