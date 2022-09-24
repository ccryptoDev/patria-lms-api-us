import { RouteConfig } from "vue-router";

import Repayment from "@/user-application/repayment/pages/Repayment.vue";
import { isUserAuthenticated } from "@/user-application/authentication/helpers";

const routes: Array<RouteConfig> = [
  {
    path: "/repayment",
    component: Repayment,
    name: "repayment",
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
