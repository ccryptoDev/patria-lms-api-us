import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import VueSweetalert2 from "vue-sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import VueFinalModal from "vue-final-modal";
import { BootstrapVue } from "bootstrap-vue";
import VueMask from "v-mask";
import Vue2Filters from "vue2-filters";
import VueHtmlToPaper from "vue-html-to-paper";
import { ValidationObserver, ValidationProvider, extend } from "vee-validate";
import * as rules from "vee-validate/dist/rules";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCheckCircle,
  faDownload,
  faCloudUploadAlt,
  faCircleNotch,
  faCheck,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
  faQuestionCircle,
  faCheckCircle as farFaCheckCircle,
} from "@fortawesome/free-regular-svg-icons";
import {
  faCcVisa,
  faCcMastercard,
  faCcAmex,
  faCcDiscover,
} from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import contractUrl from "../contract.stylesUrl";
import "./helpers/filters";
//! will override button styles
// import "bootstrap/dist/css/bootstrap.css";
// import "bootstrap-vue/dist/bootstrap-vue.css";

library.add(
  faCcAmex,
  faCcDiscover,
  faCcMastercard,
  faCcVisa,
  faCheck,
  faCheckCircle,
  faCircleNotch,
  faCloudUploadAlt,
  faDownload,
  faQuestionCircle,
  farFaCheckCircle,
  faTimes
);

Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.config.productionTip = false;

// Vee validate rules
for (const [rule, validation] of Object.entries(rules)) {
  extend(rule, {
    ...validation,
  });
}

Vue.component("ValidationObserver", ValidationObserver);
Vue.component("ValidationProvider", ValidationProvider);

const vueHtmlToPaperOptions = {
  name: "_blank",
  styles: [`${contractUrl}/assets/styles/css/contract.css`],
};

Vue.use(VueSweetalert2);
Vue.use(VueFinalModal());
Vue.use(BootstrapVue);
Vue.use(VueMask);
Vue.use(Vue2Filters);
Vue.use(VueHtmlToPaper, vueHtmlToPaperOptions);

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount("#app");
