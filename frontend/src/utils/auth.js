import {jwtDecode} from "jwt-decode";

export const getDecodedToken = () => {
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  const decoded = getDecodedToken();
  if (!decoded) return false;

  const now = Date.now() / 1000;
  return decoded.exp > now;
};

export const isAdmin = () => {
  const decoded = getDecodedToken();
  return decoded?.is_admin === true;
};