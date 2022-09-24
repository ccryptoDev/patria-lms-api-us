import axios from "axios";
import baseUrl from "../../../app.config";

export default {
  actions: {
    async getPracticeData(ctx: any) {
      const { token } = JSON.parse(
        localStorage.getItem("adminToken") as string
      );
      const response = await fetch(
        `${baseUrl}/api/admin/dashboard/practiceManagements/locations`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((response) => response.json())
        .then((result) => result)
        .catch((err) => {
          return err;
        });
      if (response.statusCode != 0) {
        ctx.commit("updatePracticeManagement", response);
      }
    },
    async postApplicationLink(ctx: any, req: any) {
      const { token } = JSON.parse(
        localStorage.getItem("adminToken") as string
      );
      const response = await fetch(
        `${baseUrl}/api/admin/dashboard/application/link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(req),
        }
      )
        .then((response) => response.json())
        .then((result) => result)
        .catch((err) => {
          return err;
        });
      if (response.statusCode != 0) {
        ctx.commit("updateApplicationLink", response);
      }
    },
  },
  mutations: {
    updatePracticeManagement(state: any, value: any) {
      state.practiceData = value;
    },
    updateApplicationLink(state: any, value: any) {
      state.applicationLink = value;
    },
  },
  state: {
    practiceData: [],
    applicationLink: "",
  },
  getters: {
    getPracticeData(state: any) {
      return state.practiceData;
    },
  },
};
