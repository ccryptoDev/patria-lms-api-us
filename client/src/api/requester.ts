import Axios from "axios";
import baseUrl from "../../app.config";
import jwt_decode from "jwt-decode";
import { getUserToken } from "@/user-application/authentication/helpers";


// Using a function to treat the JWT as a computed property to make sure the localStorage lookup happens per request
export function getRequester() {
  const JWT = localStorage.getItem("adminToken")
  let exp: any = "";
  if (!JWT) throw new Error("adminToken was not found in localStorage.");
  const token = JSON.parse(JWT);
  try {
    exp = jwt_decode(token.token);


    if (exp.exp == null) {
      localStorage.removeItem("adminToken");
      window.location.reload();
    }
    if (Date.now() >= exp.exp * 1000) {
      localStorage.removeItem("adminToken");
      window.location.reload();
    }
  } catch (err) {
    localStorage.removeItem("adminToken");
    window.location.reload();
  }
  const Authorization = `Bearer ${token.token}`;

  return Axios.create({
    baseURL: baseUrl,
    headers: { Authorization },
  });
}
