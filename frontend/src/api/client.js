import axios from "axios";

/*
---------------------------------
API BASE URLS
---------------------------------
*/

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

export const AI_BASE_URL =
  process.env.REACT_APP_AI_BASE_URL || "http://localhost:8000";

/*
---------------------------------
AXIOS INSTANCE
---------------------------------
*/

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // allow AI prediction up to 60 seconds
});

/*
---------------------------------
REQUEST INTERCEPTOR
Attach JWT token automatically
---------------------------------
*/

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/*
---------------------------------
RESPONSE INTERCEPTOR
Handle expired tokens / errors
---------------------------------
*/

api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response) {
      const status = error.response.status;

      // token expired or unauthorized
      if (status === 401 || status === 403) {
        console.warn("Session expired. Redirecting to login.");

        localStorage.removeItem("token");

        window.location.href = "/";
      }
    }

    if (error.code === "ECONNABORTED") {
      console.error("Request timeout. AI service may be slow.");
    }

    return Promise.reject(error);
  }
);