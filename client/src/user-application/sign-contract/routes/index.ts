import { RouteConfig } from "vue-router";

import Contract from "@/user-application/sign-contract/pages/Contract.vue";
import { isUserAuthenticated } from "@/user-application/authentication/helpers";

const routes: Array<RouteConfig> = [
  {
    path: "/sign-contract",
    component: Contract,
    name: "sign-contract",
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
