<template>
  <div>
    <loader v-if="!userData" />
    <div v-else>
      <h3 style="margin: 10px 0 10px 10px; font-weight: bold">
        User Information
      </h3>
      <!-- <div>
        <span class="userData-lastname" style="font-weight: bold"></span
        ><span style="font-weight: bold; color: #f39c12"
          ><i
            class="fa fa-exclamation-triangle"
            aria-hidden="true"
            style="margin-right: 5px"
          ></i
          >This user is in collections.</span
        >
      </div> -->
      <table>
        <tbody>
          <tr>
            <td>User Reference</td>
            <td>{{ userData.userReference }}</td>
            <td></td>
          </tr>
          <tr>
            <td>Name</td>
            <td v-if="!isUserEdit.username">{{ userData.name }}</td>
            <td v-if="isUserEdit.username">
              <input v-if="isUserEdit.username" @change="onUpdateUserInfo($event, 'firstName')" placeholder="First Name"
                v-model="updatedData.firstName" type="text" />
              <input v-if="isUserEdit.username" @change="onUpdateUserInfo($event, 'lastName')" placeholder="Last Name"
                v-model="updatedData.lastName" type="text" />
            </td>
            <td>
              <i @click="onClickEditIcon('username')" v-if="!isUserEdit.username" style="cursor: pointer;"
                class="material-icons">edit</i>
              <div v-if="isUserEdit.username">
                <i @click="onClickEditIcon('username')" style="cursor: pointer; color: red"
                  class="material-icons">close</i>
                <i style="cursor: pointer; margin-left: 15px;" @click="onSaveUpdatedInfo('username')"
                  class="material-icons">save</i>
              </div>
            </td>
          </tr>
          <tr>
            <td>Email Address</td>
            <td>
              <span v-if="!isUserEdit.email">{{ userData.email }}</span>
              <input v-if="isUserEdit.email" @change="onUpdateUserInfo($event, 'email')" :placeholder="userData.email"
                v-model="updatedData.email" type="email" />
            </td>
            <td>
              <i @click="onClickEditIcon('email')" v-if="!isUserEdit.email" style="cursor: pointer;"
                class="material-icons">edit</i>
              <div v-if="isUserEdit.email">
                <i @click="onClickEditIcon('email')" style="cursor: pointer; color: red"
                  class="material-icons">close</i>
                <i style="cursor: pointer; margin-left: 15px;" @click="onSaveUpdatedInfo('email')"
                  class="material-icons">save</i>
              </div>
            </td>
          </tr>
          <tr>
            <td>Phone Number</td>
            <td>
              <ul v-if="!isUserEdit.phoneNumber">
                <li v-for="item in userData.phones" :key="item.phone">
                  <span style="font-weight: bold">
                    {{ item.type }}
                  </span>
                  {{ item.phone | phone }}
                </li>
              </ul>
              <div v-if="isUserEdit.phoneNumber">
                <select style="width: 208px; padding: 5px;" v-model="selectedPhoneType"
                  @change="onUpdateUserInfo($event, 'phoneNumberType')">
                  <option disabled value="">Please select one</option>
                  <option v-for="item in phoneTypesList" :value="item" v-bind:key="item">{{ item }}</option>
                </select><br />
                <input @change="onUpdateUserInfo($event, 'phoneNumber')" :placeholder="userData.phoneNumber"
                  v-model="updatedData.phoneNumber" maxlength="10" />
              </div>

            </td>
            <td>
              <i @click="onClickEditIcon('phoneNumber')" v-if="!isUserEdit.phoneNumber" style="cursor: pointer;"
                class="material-icons">add</i>
              <div v-if="isUserEdit.phoneNumber">
                <i @click="onClickEditIcon('phoneNumber')" style="cursor: pointer; color: red"
                  class="material-icons">close</i>
                <i style="cursor: pointer; margin-left: 15px;" @click="onSaveUpdatedInfo('phoneNumber')"
                  class="material-icons">save</i>
              </div>
            </td>

          </tr>
          <tr>
            <td>Date of Birth</td>
            <td>{{ userData.dateOfBirth | date }}</td>
            <td></td>
          </tr>
          <tr>
            <td>Address</td>
            <td v-if="!isUserEdit.address">
              <div>
                {{ userData.street
                }}<span v-if="userData.unitApt">, {{ userData.unitApt }}</span>
              </div>
              <div>{{ userData.city }}, {{ userData.state }}</div>
              <div>{{ userData.zipCode }}</div>
            </td>
            <td v-if="isUserEdit.address">
              <div>
                <input @change="onUpdateUserInfo($event, 'street')" placeholder="street" v-model="updatedData.street"
                  maxlength="10" /><br />
              </div>
              <div>
                <input @change="onUpdateUserInfo($event, 'city')" placeholder="city" v-model="updatedData.city"
                  maxlength="10" />,
                <input @change="onUpdateUserInfo($event, 'city')" placeholder="state" v-model="updatedData.state"
                  maxlength="10" />
              </div>
              <div>
                <input @change="onUpdateUserInfo($event, 'zipCode')" placeholder="Zip Code"
                  v-model="updatedData.zipCode" maxlength="10" />
              </div>
            </td>
            <td>
              <i v-if="!isUserEdit.address" @click="onClickEditIcon('address')" style="cursor: pointer;"
                class="material-icons">edit</i>
              <div v-if="isUserEdit.address">
                <i @click="onClickEditIcon('address')" style="cursor: pointer; color: red"
                  class="material-icons">close</i>
                <i style="cursor: pointer; margin-left: 15px;" @click="onSaveUpdatedInfo('address')"
                  class="material-icons">save</i>
              </div>
            </td>
          </tr>
          <tr>
            <td>State</td>
            <td>{{ userData.state }}</td>
          </tr>
          <tr>
            <td>Social Security Number</td>
            <td>{{ userData.ssnNumber | maskedSSN }}</td>
            <td></td>
          </tr>
          <tr>
            <td>Registration Date</td>
            <td>{{ new Date(userData.registeredAt).toLocaleString() }}</td>
            <td></td>
          </tr>
          <tr>
            <td>Last Profile Updated Date</td>
            <td>
              {{ new Date(userData.lastProfileUpdatedAt).toLocaleString() }}
            </td>
            <td></td>
          </tr>
          <tr v-if="
            userJWTData.role === adminRoles.UserServicing ||
            userJWTData.role === adminRoles.SuperAdmin
          ">
            <td>Annual Income</td>
            <td>{{ userData.annualIncome | currency }}</td>
          </tr>
          <tr v-if="
            userJWTData.role === adminRoles.UserServicing ||
            userJWTData.role === adminRoles.SuperAdmin
          ">
            <td>Monthly Income</td>
            <td>{{ userData.monthlyIncome | currency }}</td>
          </tr>
          <tr v-if="userData.requestedAmount">
            <td>Anticipated Financed Amount</td>
            <td>{{ userData.requestedAmount | currency }}</td>
          </tr>
          <tr v-if="
            userData.preDTIdebt &&
            (userJWTData.role === adminRoles.UserServicing ||
              userJWTData.role === adminRoles.SuperAdmin)
          ">
            <td>Pre DTI Debt</td>
            <td>{{ userData.preDTIdebt | currency }}</td>
            <td></td>
          </tr>
          <tr v-if="
            userData.preDTIdebtInPercents &&
            (userJWTData.role === adminRoles.UserServicing ||
              userJWTData.role === adminRoles.SuperAdmin)
          ">
            <td>Pre DTI Debt (%)</td>
            <td>{{ userData.preDTIdebtInPercents }}%</td>
            <td></td>
          </tr>
          <tr>
            <td>Financing Reference Number</td>
            <td>
              {{ userData.financingReferenceNumber }}
            </td>
            <td></td>
          </tr>
          <tr>
            <td>Financing Status</td>
            <td>{{ userData.financingStatus | capitalize }}</td>
            <td></td>
          </tr>
          <tr>
            <td>Employer name</td>
            <td>{{ userData.employerName }}</td>
            <td></td>
          </tr>
          <tr>
            <td>Employer phone</td>
            <td>{{ userData.employerPhoneNumber }}</td>
            <td></td>
          </tr>
          <tr v-if="paymentManagement">
            <td>Total Balance</td>
            <td>{{ paymentManagement.payOffAmount | currency }}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";

import { adminDashboardRequests } from "@/api/admin-dashboard";
import Loader from "@/components/primitives/Loader.vue";
import { errorHandler } from "@/api/error-handler";
import { getUserData } from "@/admin-dashboard/authentication/helpers";
import { getAdminRoles } from "@/admin-dashboard/helpers";

export default Vue.extend({
  components: { Loader },
  props: [
    'screenTrackingId',
  ],
  data() {
    return {
      phoneTypesList: ['Cell', 'Residence', 'Work'],
      selectedPhoneType: 'Cell',
      userData: null as any,
      userJWTData: getUserData(),
      adminRoles: getAdminRoles(),
      isUserEdit: {
        email: false,
        phoneNumber: false,
        username: false,
        address: false,
      },
      paymentManagement: null as any,
      updatedData: {
        email: null,
        phoneNumber: null,
        firstName: null,
        lastName: null,
        state: null,
        street: null,
        city: null,
        zipCode: null,
      }
    };
  },
  methods: {
    async onUpdateUserInfo(e: any, fieldName: 'email' | 'phoneNumber' | 'firstName' | 'lastName' | 'street' | 'city' | 'state' | 'zipCode' | 'phoneNumberType') {
      if (fieldName === 'phoneNumberType') {
        this.selectedPhoneType = e.target.value;
        return;
      }
      this.$set(this.updatedData, fieldName, e.target.value);
      return null;
    },
    async onSaveUpdatedInfo(fieldName: string) {
      try {
        const isEmpty = Object.values(this.updatedData).find((item) => !item)
        if (isEmpty) {
          await this.$swal({
            title: "Error",
            text: fieldName === 'email' ? `Verification Email has been sent to ${this.updatedData.email}` : 'Updated Successfully',
            icon: "error",
          });
        }
        const payload: any = { screenTrackingId: this.screenTrackingId };
        const { firstName, lastName, email, phoneNumber, state, street, zipCode, city } = this.updatedData;

        switch (fieldName) {
          case 'email': {
            if (email && email !== this.userData?.email) {
              this.isUserEdit.email = false;
              payload["secondaryEmail"] = this.updatedData.email;
              break;
            }
            return;
          }
          case 'phoneNumber': {
            if (phoneNumber && phoneNumber !== this.userData?.phoneNumber) {
              this.isUserEdit.phoneNumber = false;
              payload["phoneNumber"] = this.updatedData.phoneNumber;
              payload["phoneNumberType"] = this.selectedPhoneType;
              this.userData?.phones?.push({ phone: phoneNumber });
              break;
            }
            return;
          }
          case 'username': {
            if (!firstName || !lastName) return;
            const username = `${firstName} ${lastName}`
            if (username && username !== this.userData?.name) {
              this.isUserEdit.username = false;
              payload["firstName"] = firstName;
              payload["lastName"] = lastName;
              payload['name'] = username;
              break;
            }
            return;
          }
          case 'address': {
            payload['state'] = state || this.userData.state;
            payload['zipCode'] = zipCode || this.userData.zipCode;
            payload['street'] = street || this.userData.street;
            payload['city'] = city || this.userData.city;
            this.isUserEdit.address = false;
            break;
          }
          default:
            break;
        }
        const response = await adminDashboardRequests.updateUserData(payload);
        delete payload.screenTrackingId;
        this.userData = { ...this.userData, ...payload }
        await this.$swal({
          title: "Success",
          text: fieldName === 'email' ? `Verification Email has been sent to ${this.updatedData.email}` : response.data.message,
          icon: "success",
        });
        return null;
      } catch (error) {
        console.log("ERROR::", " ", error);
        const errMsg = error?.response?.data?.message;
        const errCode = error?.response?.data?.statusCode;
        await this.$swal({
          title: "Error",
          text: `${errMsg}`,
          icon: "error",
        });
      }

    },
    async onClickEditIcon(fieldName: 'email' | 'username' | 'phoneNumber' | 'address') {
      const oldValue = this.isUserEdit[fieldName];
      this.$set(this.isUserEdit, fieldName, !oldValue);
      return null;
    }
  },

  async created() {
    try {
      const { data } = await adminDashboardRequests.getApplication(
        this.screenTrackingId
      );
      const res = await adminDashboardRequests.getPaymentManagement(
        this.screenTrackingId
      );
      this.userData = data;
      this.paymentManagement = res.data;
    } catch (error) {
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

tr> :first-child {
  font-weight: bold;
}
</style>
