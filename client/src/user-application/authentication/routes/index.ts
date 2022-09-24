import { RouteConfig } from "vue-router";

import Login from "@/user-application/authentication/pages/Login.vue";
import ForgotPassword from "@/user-application/authentication/pages/ForgotPassword.vue";
import ResetPassword from "@/user-application/authentication/pages/ResetPassword.vue";
import ChangePassword from "@/user-application/authentication/pages/ChangePassword.vue";
import UpdateCustomerDetails from "@/user-application/authentication/pages/UpdateCustomerDetails.vue";
import CloseLoanDetails from "@/user-application/authentication/pages/CloseLoan.vue";
import { isUserAuthenticated } from "@/user-application/authentication/helpers";
import { closeLoanDetails } from "../api";

const routes: Array<RouteConfig> = [
  {
    path: "/login",
    component: Login,
    name: "userLogin",
  },
  {
    path: "/forgot-password",
    component: ForgotPassword,
    name: "forgotPassword",
  },
  {
    path: "/reset-password/:token",
    component: ResetPassword,
    name: "resetPassword",
  },
  {
    path: "/update-customerdetails/:token",
    component: UpdateCustomerDetails,
    name: "updateCustomerDetails",
  },
  {
    path: "/closeloandetails/:token",
    component: CloseLoanDetails,
    name: "closeLoanDetails",
  },
  {
    path: "/change-password",
    component: ChangePassword,
    name: "changePassword",
    beforeEnter: (to, _from, next) => {
      if (!isUserAuthenticated()) {
        next("userLogin");
      } else {
        next();
      }
    },
  },
];

export default routes;
