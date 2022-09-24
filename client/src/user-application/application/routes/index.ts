import { RouteConfig } from "vue-router";

import Apply from "../pages/Apply.vue";
import ApplyViaApplicationLink from "../pages/ApplyViaApplicationLink.vue";

const routes: Array<RouteConfig> = [
  {
    path: "/apply/:applicationLinkId",
    component: ApplyViaApplicationLink,
    name: "ApplyViaApplicationLink",
  },
  {
    path: "/apply",
    component: Apply,
    name: "apply",
  },
];

export default routes;
