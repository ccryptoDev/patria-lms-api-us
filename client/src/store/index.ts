import Vue from "vue";
import Vuex from "vuex";

import layout from "@/user-application/layout/store";
import adminLogin from "@/store/modules/adminLogin";
import contract from "@/user-application/sign-contract/store";
import { loanTableEntries } from "@/store/modules/loanTableEntries";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    adminLogin,
    contract,
    layout,
    loanTableEntries,
  },
});
