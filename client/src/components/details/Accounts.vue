<template>
  <div>
    <div
      style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0 10px 10px; font-weight: bold;">
      <h3 style="font-weight: bold;">
        Debit Cards
      </h3>
      <AddCardButton :screenTrackingId="screenTrackingId" @reloadPage="reloadPage" />
    </div>
    <table v-if="cards && cards.length > 0">
      <tbody>
        <tr>
          <th>Name on Card</th>
          <th>Default</th>
          <th>Last 4 digits</th>
          <th>Card expiration</th>
          <th>Added/Updated</th>
        </tr>
        <tr v-for="card in cards" :key="card.paymentMethodToken">
          <td>{{ card.firstName }}{{ card.lastName }}</td>
          <td class="row" style="margin:0px; height: 100%;">
            <input v-if="card.isDefault" :id="card._id" class="checks" type="checkbox" style=""
              v-on:change="check($event)" checked />
            <input v-else :id="card._id" class="checks" type="checkbox" style=""
              v-on:change="check($event)" />
          </td>
          <td>{{ card.cardNumberLastFour }}</td>
          <td v-if="isCardExpired(card.cardExpiration)">
            {{ card.cardExpiration }}
            <span style="color: #ef5493;">(Expired)</span>
          </td>
          <td v-else>{{ card.cardExpiration }}</td>
          <td>{{ card.updatedAt | timestamp }}</td>
          <!-- <td>
            <button :disabled="isLoading" type="button" class="btn btn-primary"
              style="font-weight: bold; text-align: center; border-radius: 10px;" id="resignEFTA"
              @click.prevent="resignEFTA(card.paymentMethodToken)">
              <span>Resign EFTA</span>
              <b-spinner small v-show="isLoading"></b-spinner>
            </button>
          </td> -->
          <td>
            <button :disabled="isLoading" type="button" class="btn btn-primary"
              style="font-weight: bold; text-align: center; border-radius: 10px;" id="resignEFTA"
              @click.prevent="removeCardOrBank('CARD', card._id)">
              <span>Remove</span>
              <b-spinner small v-show="isLoading"></b-spinner>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div
      style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0 10px 10px; font-weight: bold;">
      <h3 style="font-weight: bold;">
        Bank accounts
      </h3>
      <!-- <AddCardButton
        v-if="userData.role === adminRoles.SuperAdmin"
        :screenTrackingId="screenTrackingId"
        @reloadPage="reloadPage"
      /> -->
    </div>
    <table v-if="bankAccounts && bankAccounts.length > 0">
      <tbody>
        <tr>
          <th>Bank name</th>
          <th>Default</th>
          <th>Institution type</th>
          <th>Account number</th>
          <th>Routing number</th>
        </tr>
        <tr v-for="bank in bankAccounts" :key="bank._id">
          <td>{{ bank.bankName }}</td>
          <td class="row" style="margin:0px; height: 100%;">
            <input v-if="bank.isDefault" :id="bank._id" class="checks" type="checkbox" style=""
              v-on:change="check($event)" checked />
            <input v-else :id="bank._id" class="checks" type="checkbox" style="" v-on:change="check($event)" />
          </td>
          <td>{{ bank.institutionType }}</td>
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
          <td>
            <button :disabled="isLoading" type="button" class="btn btn-primary"
              style="font-weight: bold; text-align: center; border-radius: 10px;" id="resignEFTA"
              @click.prevent="removeCardOrBank('ACH', bank._id)">
              <span>Remove</span>
              <b-spinner small v-show="isLoading"></b-spinner>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="row" style="margin-top: 20px;">
      <div style="margin: 10px;">
        <button @click="hideModal" v-if="modal">Cancel</button>
      </div>
      <div style="margin: 10px;">
        <button class="primary" v-if="modal" @click="saveDefaultCard">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import { adminDashboardRequests } from "@/api/admin-dashboard";
import { errorHandler } from "@/api/error-handler";
import AddCardButton from "@/components/buttons/AddCardButton.vue";
import { isCardExpired, getAdminRoles } from "@/admin-dashboard/helpers";
import { getUserData } from "@/admin-dashboard/authentication/helpers";

export default Vue.extend({
  components: {
    AddCardButton,
  },

  props: {
    screenTrackingId: {
      required: true,
      type: String,
    },
  },

  data() {
    return {
      cards: [],
      bankAccounts: [],
      userData: getUserData(),
      adminRoles: getAdminRoles(),
      modal: false,
      currentDC: {},
      initialDC: {},
      isDefault: false,
      intialDefaultCardId: null,
      isLoading: false,
      componentKey: 0,
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
          const defaultCard = cards.find(
            (card: { _id: any }) =>
              card._id == box.id
          );
          return defaultCard._id;
        }
      }
    },
    check: function (e: any) {
      this.modal = true;
      const checkbox = document.querySelectorAll(".checks");
      this.currentDC = this.setDefaultCard(e.target.id, checkbox, this.cards);
    },
    hideModal(e: any) {
      this.modal = false;
      //revert to initialDC
      const checkbox = document.querySelectorAll(".checks");
      this.setDefaultCard(this.initialDC, checkbox, this.cards);
    },
    saveDefaultCard: async function () {
      const paymentMethodToken: any = this.currentDC;
      //update card
      await adminDashboardRequests.updateUserCard(paymentMethodToken);
      this.initialDC = this.currentDC;
      this.modal = false;
      this.getUserCards();
    },
    isCardExpired(cardExpiration: string) {
      return isCardExpired(cardExpiration);
    },
    async getUserCards() {
      const { data } = await adminDashboardRequests.getUserCards(
        this.screenTrackingId
      );
      this.cards = data;
      const defaultCard = data.find((card: any) => card.isDefault === true);
      this.initialDC = defaultCard._id;
      this.currentDC = defaultCard._id;
      const checkbox = document.querySelectorAll(".checks");
      this.setDefaultCard(this.currentDC, checkbox, this.cards);
    },
    async reloadPage() {
      try {
        const {
          data: userBankAccounts,
        } = await adminDashboardRequests.listUserBanks(this.screenTrackingId);

        this.bankAccounts = userBankAccounts;

        const { data } = await adminDashboardRequests.getUserCards(
          this.screenTrackingId
        );
        this.cards = data;
        const defaultCard = data.find((card: any) => card.isDefault === true);
        this.initialDC = defaultCard.paymentMethodToken;
        this.currentDC = defaultCard.paymentMethodToken;
        // this.saveDefaultCard();
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
    async resignEFTA(cardToken: string) {
      this.isLoading = true;
      await adminDashboardRequests.resignEFTA(this.screenTrackingId, cardToken);
      this.isLoading = false;
      await this.$swal({
        title: "Success!",
        text: "EFTA Resigned!",
        icon: "success",
      });
      this.reloadPage();
      this.isLoading = false;
    },
    async removeCardOrBank(paymentType: "ACH" | "CARD", paymentId: string) {
      const payload = {
        screenTrackingId: this.screenTrackingId,
        paymentType,
        paymentId,
      };
      await adminDashboardRequests.removeCardOrAchAccount(payload);
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
      /*
      const userCardsPromise = adminDashboardRequests.getUserCards(
        this.screenTrackingId
      );

      const userBankAccountsPromise = adminDashboardRequests.listUserBanks(
        this.screenTrackingId
      );

      interface ResponseFormat extends AxiosResponse {
        data: Array<Record<string, unknown>>
      }
      const processData = ([{ data: userCards }, { data: userBankAccounts }]: Array<ResponseFormat>) => {
        this.cards = userCards;
        this.bankAccounts = userBankAccounts;
        const defaultCard = userCards.find(
          (card: any) => card.isDefault === true
        );
        this.initialDC = defaultCard?.paymentMethodToken;
        this.currentDC = defaultCard?.paymentMethodToken;
      };

      await Promise.all([userCardsPromise, userBankAccountsPromise]).then(processData.bind(this));
      */
      const { data: userCards } = await adminDashboardRequests.getUserCards(
        this.screenTrackingId
      );
      this.cards = userCards;
      const defaultCard = userCards.find(
        (card: any) => card.isDefault === true
      );
      this.initialDC = defaultCard?._id;
      this.currentDC = defaultCard?._id;

      const {
        data: userBankAccounts,
      } = await adminDashboardRequests.listUserBanks(this.screenTrackingId);

      this.bankAccounts = userBankAccounts;
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
