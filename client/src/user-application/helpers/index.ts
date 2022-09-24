import axios, { AxiosResponse } from "axios";
import moment from "moment";

export const getIp = async (): Promise<AxiosResponse<{ ip: string }>> => {
  return axios.get("https://api.ipify.org?format=json");
};

export const isCardExpired = (cardExpiration: string) => {
  const splitCardExpiration = cardExpiration.split("/");
  const cardExpirationMonth = +splitCardExpiration[0];
  const cardExpirationYear = +splitCardExpiration[1] + 2000;
  const today = moment();
  const thisYear = today.year();
  const thisMonth = today.month() + 1;

  if (cardExpirationYear > thisYear) {
    return false;
  } else if (
    cardExpirationYear === thisYear &&
    cardExpirationMonth >= thisMonth
  ) {
    return false;
  } else {
    return true;
  }
};

