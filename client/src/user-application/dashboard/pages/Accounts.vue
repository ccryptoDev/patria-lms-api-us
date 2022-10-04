<template>
  <div>
    <div class="summary-section">
      <div class="summary-row large-padding">
        <div class="summary-title">Debit Cards</div>
        <div class="summary-action">
          <AddCardButton v-if="!isLoading" :screenTrackingId="screenTrackingId"
            :paymentManagementId="paymentManagementData._id"
            :autopayStatus="paymentManagementData.canRunAutomaticPayment" :addCardFlag="addCardFlag"
            @reloadPage="reloadPage" />
        </div>
      </div>
      <table v-if="cards && cards.length > 0">
        <tbody>
          <tr fixed width="120">
            <th>Name on Card</th>
            <th>Default</th>
            <th>Last 4 digits</th>
            <th>Card expiration</th>
            <th>Added/Updated</th>
          </tr>
          <tr v-for="card in cards" :key="card._id">
            <td>{{ card.nameOnCard }} </td>
            <td class="row" style="margin:0px; height: 100%;">
              <input v-if="card.isDefault" :id="card._id" class="checks" type="checkbox" style=""
                v-on:change="check($event)" checked />
              <input v-else :id="card._id" class="checks" type="checkbox" style=""
                v-on:change="check($event)" />
            </td>
            <td>{{ card.cardNumberLastFour }}</td>
            <td v-if="isCardExpired(card.cardExpiration) && card.paymentType==='CARD'">
              {{ card.cardExpiration }}
              <span style="color: #ef5493;">(Expired)</span>
            </td>
            <td v-else>{{ card.cardExpiration }}</td>
            <td>{{ card.updatedAt | date }}</td>
            <!-- <td>
              <button :disabled="isLoading" type="button" class="btn btn-primary"
                style="font-weight: bold; text-align: center; border-radius: 10px;" id="resignEFTA"
                @click.prevent="removeCardOrBank('CARD', card._id)">
                <span>Remove</span>
                <b-spinner small v-show="isLoading"></b-spinner>
              </button>
            </td> -->
          </tr>
        </tbody>
      </table>
      <table v-if="userBankAccount && userBankAccount.length > 0">
        <tbody>
          <tr>
            <th>Bank name</th>
            <th>Default</th>
            <th>Account type</th>
            <th>Account number</th>
            <th>Routing number</th>
          </tr>
          <tr v-for="bank in userBankAccount" :key="bank._id">
            <td>{{ bank.financialInstitution }}</td>
            <td class="row" style="margin:0px; height: 100%;">
              <input v-if="bank.isDefault" :id="bank._id" class="checks" type="checkbox" style=""
                v-on:change="check($event)" checked />
              <input v-else :id="bank._id" class="checks" type="checkbox" style="" v-on:change="check($event)" />
            </td>
            <td>{{ bank.accountType }}</td>
            <td>{{ bank.accountNumber }}</td>
            <td>{{ bank.routingNumber }}</td>
            <!-- <td>
                      <button :disabled="isLoading" type="button" class="btn btn-primary"
                        style="font-weight: bold; text-align: center; border-radius: 10px;" id="resignEFTA"
                        @click.prevent="resignEFTA(card.paymentMethodToken)">
                        <span>Resign EFTA</span>
                        <b-spinner small v-show="isLoading"></b-spinner>
                      </button>
                    </td> -->
            <!-- <td>
              <button :disabled="isLoading" type="button" class="btn btn-primary"
                style="font-weight: bold; text-align: center; border-radius: 10px;" id="resignEFTA"
                @click.prevent="removeCardOrBank('ACH', bank._id)">
                <span>Remove</span>
                <b-spinner small v-show="isLoading"></b-spinner>
              </button>
            </td> -->
          </tr>
        </tbody>
      </table>
      <div class="row" style="margin-top: 20px;">
        <div style="margin: 10px;">
          <button @click="hideModal" v-if="modal">Cancel</button>
        </div>
        <div style="margin: 10px;">
          <button class="primary" v-if="modal" @click="saveDefaultCard">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script lang="ts">

import { adminDashboardRequests } from "@/api/admin-dashboard";
import { getApplicationData, updateUserCard, removeCardOrAchAccount } from "@/user-application/application/api";
import { getDashboardData } from "@/user-application/dashboard/api";
import Vue from "vue";
import AddCardButton from "@/user-application/dashboard/components/AddCardButton.vue";
import { isCardExpired } from "@/admin-dashboard/helpers";
import { errorHandler } from "@/api/error-handler";

export default Vue.extend({
  components: { AddCardButton, },

  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
    addCardFlag: {
      required: true,
      type: Boolean,
    },
  },

  data() {
    return {
      cards: [] as Array<any>,
      modal: false,
      currentDC: {},
      initialDC: {},
      isDefault: false,
      paymentManagementData: {},
      intialDefaultCardId: null,
      isLoading: true,
      componentKey: 0,
      userBankAccount: [] as Array<any>,
    };
  },

  methods: {
    setDefaultCard(id: any, checkbox: any, cards: any) {
      //uncheck other boxes
      for (const box of checkbox) {
        if (box.id !== id) {
          box.checked = false;
        }
      }
      //set default card
      for (const box of checkbox) {
        if (box.id == id) {
          box.checked = true;
          const defaultCard = cards.find((card: { _id: any; }) => card._id == box.id);
          return defaultCard._id;
        }
      }
    },
    check: function (e: any) {
      this.modal = true;
      const checkbox = document.querySelectorAll('.checks');
      this.currentDC = this.setDefaultCard(e.target.id, checkbox, this.cards);
    },
    hideModal(e: any) {
      this.modal = false;
      //revert to initialDC
      const checkbox = document.querySelectorAll('.checks');
      this.setDefaultCard(this.initialDC, checkbox, this.cards);
    },
    separateCardAndAchAccount: function (userCard: Array<any>) {
      if (!userCard) return;
      this.userBankAccount = userCard.filter((item) => item.paymentType === 'ACH');
      this.cards = userCard.filter((item) => item.paymentType === 'CARD');
    },
    saveDefaultCard: async function () {

      const paymentMethodToken: any = this.currentDC;
      // update card
      const requestBody = {
        // paymentMethodToken: paymentMethodToken,
        paymentId: paymentMethodToken
      }
      await updateUserCard(requestBody);
      this.initialDC = this.currentDC;
      this.modal = false;
      this.getUserCards();
    },
    isCardExpired(cardExpiration: string) {
      return isCardExpired(cardExpiration);
    },
    async getUserCards() {
      const [
        applicationDataResponse,
        dashboardDataResponse,
      ] = await Promise.all([getApplicationData(), getDashboardData()]);
      const {
        userAccountsData,
      } = dashboardDataResponse.data;
      this.cards = userAccountsData;
      const defaultCard = userAccountsData.find((card: any) => card.isDefault === true);
      this.separateCardAndAchAccount(userAccountsData);
      this.initialDC = defaultCard._id;
      this.currentDC = defaultCard._id;
      const checkbox = document.querySelectorAll('.checks');
      this.setDefaultCard(this.currentDC, checkbox, this.cards);
    },
    async reloadPage() {
      try {
        const [
          applicationDataResponse,
          dashboardDataResponse,
        ] = await Promise.all([getApplicationData(), getDashboardData()]);
        const {
          userAccountsData,
        } = dashboardDataResponse.data;
        this.cards = userAccountsData;
        this.separateCardAndAchAccount(userAccountsData);
        const defaultCard = userAccountsData.find((card: any) => card.isDefault === true);
        if (defaultCard) {
          this.initialDC = defaultCard.paymentMethodToken;
          this.currentDC = defaultCard.paymentMethodToken;
          // this.saveDefaultCard();
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
    async removeCardOrBank(paymentType: "ACH" | "CARD", paymentId: string) {
      const payload = {
        screenTrackingId: this.screenTrackingId,
        paymentType,
        paymentId,
      };
      await removeCardOrAchAccount(payload);
      await this.$swal({
        title: "Success!",
        text: "Account has been removed",
        icon: "success",
      });
      this.reloadPage();
    },
  },

  async mounted() {
    try {
      const [
        applicationDataResponse,
        dashboardDataResponse,
      ] = await Promise.all([getApplicationData(), getDashboardData()]);
      const {
        userAccountsData,
        paymentManagementData,
      } = dashboardDataResponse.data;
      this.paymentManagementData = paymentManagementData;
      this.cards = userAccountsData;
      this.separateCardAndAchAccount(userAccountsData);
      const defaultCard = userAccountsData.find((card: any) => card.isDefault === true);
      if (defaultCard) {
        this.initialDC = defaultCard.paymentMethodToken;
        this.currentDC = defaultCard.paymentMethodToken;
      }
      this.isLoading = false;
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
});
</script>


<style scoped>
table {
  width: 100%;
  border: 1px solid #f4f4f4;
}

td {
  border: 1px solid #f4f4f4;
  padding: 10px;
}

th {
  padding: 10px;
}

.primary {
  background-color: #ea4c89;
  color: white;
}
</style>