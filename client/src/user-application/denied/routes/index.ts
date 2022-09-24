import { RouteConfig } from "vue-router";

import Denied from "@/user-application/denied/pages/Denied.vue";
import { isUserAuthenticated } from "@/user-application/authentication/helpers";

const routes: Array<RouteConfig> = [
  {
    path: "/denied",
    component: Denied,
    name: "denied",
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
