import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    // Return structured rejection
    return Promise.reject({
      message,
      statusCode: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);
