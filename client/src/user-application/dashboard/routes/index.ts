import { RouteConfig } from "vue-router";

import Dashboard from "@/user-application/dashboard/pages/Dashboard.vue";
import { isUserAuthenticated } from "@/user-application/authentication/helpers";

const routes: Array<RouteConfig> = [
  {
    path: "/dashboard",
    component: Dashboard,
    name: "userDashboard",
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
