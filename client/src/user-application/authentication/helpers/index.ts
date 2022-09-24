export const isUserAuthenticated = (): boolean => {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return false;
  }

  const { token, role } = JSON.parse(userToken);
  if (!(token && role === "User")) {
    return false;
  }

  return true;
};

export const getUserToken = (): string | undefined => {
  const userToken = localStorage.getItem("userToken");
  if (!userToken) {
    return;
  } else {
    const { token } = JSON.parse(userToken);
    return token;
  }
};
