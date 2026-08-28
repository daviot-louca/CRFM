import axios from "axios";

const apiClient = axios.create({

  baseURL: import.meta.env.VITE_API_URL,

  headers: {

    "Content-Type": "application/json",

  },

});

const getStoredToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const tokenKeys = ["token", "authToken", "accessToken", "crfmToken", "jwt"];

  for (const key of tokenKeys) {
    const value = window.localStorage.getItem(key);

    if (!value) {
      continue;
    }

    try {
      const parsed = JSON.parse(value);
      const parsedToken = parsed?.token ?? parsed?.accessToken ?? parsed?.jwt;

      if (parsedToken) {
        return parsedToken;
      }
    } catch {
      return value;
    }

    return value;
  }

  return null;
};

apiClient.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers = config.headers ?? {};

    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default apiClient;
