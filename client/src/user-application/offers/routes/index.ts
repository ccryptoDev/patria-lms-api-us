import { RouteConfig } from "vue-router";

import Offers from "@/user-application/offers/pages/Offers.vue";
import ReviewOffer from "@/user-application/offers/pages/ReviewOffer.vue";
import { isUserAuthenticated } from "@/user-application/authentication/helpers";

const routes: Array<RouteConfig> = [
  {
    path: "/offers",
    component: Offers,
    name: "offers",
    beforeEnter: (to, _from, next) => {
      if (!isUserAuthenticated()) {
        next("userLogin");
      } else {
        next();
      }
    },
  },
  {
    path: "/review-offer",
    component: ReviewOffer,
    name: "reviewOffer",
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
