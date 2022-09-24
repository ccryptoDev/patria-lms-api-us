import VueRouter from "vue-router";

import baseUrl from "../../app.config";

export const errorHandler = async (
  error: any,
  router: VueRouter
): Promise<string | undefined> => {
  let errorMessage = "";

  if (error?.response?.status === 400) {
    errorMessage = error.response.data?.error || error.response.data?.message;
  } else if (
    error?.response?.status === 401 ||
    error?.response?.status === 403
  ) {
    localStorage.clear();
    await router.push(`${baseUrl}`);
  } else if (error?.response?.status === 500) {
    errorMessage = "Something went wrong. Please try again later.";
  } else {
    errorMessage = error.message;
  }

  if (error?.response?.data?.requestId) {
    errorMessage += `.Request id: ${error.response.data.requestId}`;
  }

  if (errorMessage) {
    return errorMessage;
  }
};
