import axios, { AxiosResponse } from "axios";

import baseUrl from "../../../../app.config";
import { getUserToken } from "@/user-application/authentication/helpers";

export const createUser = async (requestBody: {
  annualIncome: number;
  city: string;
  dateOfBirth: string;
  driversLicenseNumber?: string;
  driversLicenseState?: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phones: { phone: string; type: "mobile" | "home" | "office" }[];
  practiceManagement?: string;
  requestedAmount: number;
  source: "web" | "lead-list";
  ssnNumber: string;
  state: string;
  unitApt?: string;
  street: string;
  zipCode: string;
}): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/apply`, requestBody);
};

export const getApplicationData = async (): Promise<AxiosResponse<any>> => {
  return axios.get(`${baseUrl}/api/application/user`, {
    headers: {
      Authorization: `Bearer ${getUserToken()}`,
    },
  });
};

export const removeCardOrAchAccount = async (context: {
  screenTrackingId: string, paymentType: string, paymentId: string,
}): Promise<AxiosResponse<any>> => {
  const response = await axios.post(
    `${baseUrl}/api/account/remove-accounts`, context,
    {
      headers: {
        Authorization: `Bearer ${getUserToken()}`,
      },
    }
  );

  return response;
}

export const updateUserCard = async (requestBody: {
  paymentMethodToken?: string; paymentId: string | null;
}): Promise<AxiosResponse<any>> => {
  return axios.patch(`${baseUrl}/api/application/user/cards`, requestBody, {
    headers: {
      Authorization: `Bearer ${getUserToken()}`,
    },
  });
};

export const getPracticeManagementId = async (
  id: string
): Promise<AxiosResponse<any>> => {
  return axios.get(`${baseUrl}/api/admin/dashboard/application/link/${id}`);
};

export const runCreditReport = async (token: string) => {
  return axios.post(
    `${baseUrl}/api/application/creditBureauInquiry`,
    { hardPull: false },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getApplicationLinkData = async (applicationLinkId: string) => {
  return axios.get(
    `${baseUrl}/api/admin/dashboard/application/link/${applicationLinkId}`
  );
};
