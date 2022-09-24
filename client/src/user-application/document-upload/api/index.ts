import axios, { AxiosResponse } from "axios";

import baseUrl from "../../../../app.config";
import { getUserToken } from "@/user-application/authentication/helpers";

export const uploadDocument = async (requestBody: {
  documentType: "passport" | "drivers license";
  passport?: string;
  driversLicenseFront?: string;
  driversLicenseBack?: string;
}): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/uploadDocument`, requestBody, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};
