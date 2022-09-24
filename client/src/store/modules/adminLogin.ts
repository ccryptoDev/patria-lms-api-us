import axios from "axios";

import baseUrl from "../../../app.config";

export default {
  actions: {
    async adminLogin(
      ctx: any,
      credentials: { email: string; password: string }
    ) {
      const { email, password } = credentials;
      try {
        const { data, status } = await axios.post(
          `${baseUrl}/api/admin/login`,
          {
            email,
            password,
          }
        );

        if (status !== 201) {
          throw new Error("Something went wrong, please try again later");
        }

        if (data && data.token && data.role) {
          const { email, id, practiceManagement, role, token, userName } = data;
          localStorage.setItem(
            "adminToken",
            JSON.stringify({
              email,
              id,
              practiceManagement,
              role,
              token,
              userName,
            })
          );
          ctx.commit("updateAuthAdmin", true);
          ctx.commit("updateAdminName", data.userName);
        }
      } catch (error) {
        if (error.message.includes("401")) {
          throw new Error("Email or password invalid");
        }

        throw error;
      }
    },
  },
  mutations: {
    updateAuthAdmin(state: any, value: boolean) {
      state.authAdmin = value;
    },
    updateAdminName(state: any, value: string) {
      state.adminName = value;
    },
  },
  state: {
    authAdmin: false,
  },
  getters: {
    getAuthAdmin(state: any) {
      return state.authAdmin;
    },
    getAdminName(state: any) {
      return state.adminName;
    },
  },
};
