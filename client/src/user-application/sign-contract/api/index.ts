import axios, { AxiosResponse } from "axios";

import baseUrl from "../../../../app.config";
import { getUserToken } from "@/user-application/authentication/helpers";

export const getOfferData = async (): Promise<AxiosResponse<any>> => {
  return axios.get(`${baseUrl}/api/application/contract`, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};

export const saveSignature = async (
  imgBase64: string
): Promise<AxiosResponse<any>> => {
  return axios.post(
    `${baseUrl}/api/application/esignature`,
    { imgBase64 },
    {
      headers: { Authorization: `Bearer ${getUserToken()}` },
    }
  );
};

export const finalizeApplication = async (): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/finalize`, undefined, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};
