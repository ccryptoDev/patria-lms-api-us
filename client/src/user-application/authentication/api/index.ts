import axios, { AxiosResponse } from "axios";

import baseUrl from "../../../../app.config";
import { getUserToken } from "@/user-application/authentication/helpers";
import { email } from "vee-validate/dist/rules";

export const login = async (requestBody: {
  email: string;
  password: string;
}): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/login`, requestBody);
};

export const changePassword = async (requestBody: {
  existingPassword: string;
  newPassword: string;
}): Promise<AxiosResponse<any>> => {
  return axios.patch(`${baseUrl}/api/application/changePassword`, requestBody, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};

export const updateCustomerData = async (requestBody: {
  token: string;
  ssn: string;
  annualIncome: string;
}): Promise<AxiosResponse<any>> => {
  return axios.patch(`${baseUrl}/api/application/updateCustomerData`, requestBody, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};

export const refundPaymentData = async (requestBody: {
  token: string;
}): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/refundPayment`, requestBody, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};


export const forgotPassword = async (
  email: string
): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/forgotPassword`, {
    email,
  });
};

export const resetPassword = async (token: string, password: string) => {
  return axios.patch(
    `${baseUrl}/api/application/resetPassword/${token}`,
    { password },
    { headers: { Authorization: `Bearer ${getUserToken()}` } }
  );
};

export const updateCustomerDetails = async (
  email: string
): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/updatecustomerdetails`, {
    email,
  });
};

export const closeLoanDetails = async (
  email: string
): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/closeLoanDetails`, {
    email,
  });
};

export const moveLoanCollections = async (
  email: string,
  status: string,
): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/movetocollections`, {
    email,
    status
  });
};

export const assignLoan = async (
  email: [],
  admin: string,
): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/assignloan`, {
    email,
    admin
  });
};

export const assignLoantome = async (
  email: [],
  adminid: string,
): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/assignloantome`, {
    email,
    adminid
  });
};

export const partialReturnDetails = async (
  email: string,
  amount: number
): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/partialreturn`, {
    email,
    amount
  });
};

export const getPaymentSchedule = async (
  token: string
): Promise<AxiosResponse<any>> => {
  return axios.get(`${baseUrl}/api/application/getpaymentschedule/${token}`);
};
