import axios, { AxiosResponse } from "axios";

import baseUrl from "../../../../app.config";
import { getUserToken } from "@/user-application/authentication/helpers";

export const addCard = async (requestBody: {
  billingAddress1: string;
  billingCity: string;
  billingFirstName: string;
  billingLastName: string;
  billingState: string;
  billingZip: string;
  cardCode: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
}): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/addCard`, requestBody, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};

export const makeDownPayment = async (requestBody: {
  amount: number;
  paymentMethodToken: string;
}): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/makePayment`, requestBody, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};

export const saveEFTA = async (requestBody: {
  userId: string,
  applicationReference: string;
  cardCode: string;
  cardHolder: string;
  cardIssuer: string;
  cardNumber: string;
  city: string;
  expirationMonth: string;
  expirationYear: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  selectedOffer: Record<string, any>;
  selectedState: string;
  signature: string;
  street: string;
  zipCode: string;
}): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/application/efta`, requestBody, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};

export const setupAutoPayLater = async (): Promise<AxiosResponse<any>> => {
  return axios.post(
    `${baseUrl}/api/application/skipAutoPay`,
    {},
    {
      headers: { Authorization: `Bearer ${getUserToken()}` },
    }
  );
};

export const validateCard = async (requestBody: {
  cardCode: string;
  cardNumber: string;
  expMonth: string;
  expYear: string;
}): Promise<AxiosResponse<any>> => {
  return axios.post(`${baseUrl}/api/validateCard`, requestBody, {
    headers: { Authorization: `Bearer ${getUserToken()}` },
  });
};
