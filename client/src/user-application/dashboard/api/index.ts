import axios, { AxiosResponse } from "axios";

import baseUrl from "../../../../app.config";
import { getUserToken } from "@/user-application/authentication/helpers";

export const getDashboardData = async (): Promise<AxiosResponse<any>> => {
  return axios.get(`${baseUrl}/api/application/dashboard`, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};

export const getPaymentPreview = async (requestBody: {
  screenTracking: string,
  amount?: number,
  paymentDate: any,
}): Promise<AxiosResponse<any>> => {
  return axios.post(
    `${baseUrl}/api/application/dashboard/previewPayment`,
    requestBody, {
    headers: {
      Authorization: `Bearer ${getUserToken()}`,
    },
  });
};

export const submitPayment = async (requestBody: {
  screenTracking: string,
  paymentMethodToken: string,
  amount: number,
  paymentDate: Date,
  paymentVia: string | null
}): Promise<AxiosResponse<any>> => {
  return axios.post(
    `${baseUrl}/api/application/dashboard/submitPayment`,
    requestBody, {
    headers: {
      Authorization: `Bearer ${getUserToken()}`,
    },
  });
};

export const changePaymentAmount = async (requestBody: {
  screenTracking: string,
  amount: number,
}): Promise<AxiosResponse<any>> => {
  return axios.patch(
    `${baseUrl}/api/application/dashboard/changePaymentAmount`,
    requestBody, {
    headers: {
      Authorization: `Bearer ${getUserToken()}`,
    },
  });
}

export const enableAutopay = async (requestBody: {
  paymentManagementId: string
}): Promise<AxiosResponse<any>> => {
  return axios.patch(`${baseUrl}/api/application/dashboard/enableAutopay`, requestBody, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};
