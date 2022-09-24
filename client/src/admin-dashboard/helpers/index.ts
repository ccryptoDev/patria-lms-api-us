import moment from "moment";

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

export const getAdminRoles = () => {
  return {
    SuperAdmin: "Super Admin",
    UserServicing: "Agent",
  };
};
