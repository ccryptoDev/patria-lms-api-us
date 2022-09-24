import axios, { AxiosResponse } from "axios";

import baseUrl from "../../../../app.config";
import { getUserToken } from "@/user-application/authentication/helpers";

export const getOffers = async (
  requestedLoanAmount: number
): Promise<AxiosResponse<any>> => {
  return axios.post(
    `${baseUrl}/api/application/offers`,
    { requestedLoanAmount },
    { headers: { Authorization: `Bearer ${getUserToken()}` } }
  );
};

export const saveOffer = async (requestBody: {
  skipAutoPay: boolean;
  loanId: string;
  promoSelected: boolean;
}): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/selectOffer`, requestBody, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};
