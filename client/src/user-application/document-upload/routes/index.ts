import { RouteConfig } from "vue-router";

import DocumentUpload from "@/user-application/document-upload/pages/DocumentUpload.vue";
import { isUserAuthenticated } from "@/user-application/authentication/helpers";

const routes: Array<RouteConfig> = [
  {
    path: "/document-upload",
    component: DocumentUpload,
    name: "document-upload",
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
