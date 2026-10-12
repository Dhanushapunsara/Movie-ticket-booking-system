import axios, { AxiosError } from 'axios';
import type { ApiError } from '../types';
import { tokenStorage } from '../utils/tokenStorage';

/** Shared Axios instance: base URL, JWT header and 401 handling live here. */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is rejected, clear the session and tell the app (AuthContext listens for this event)
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && tokenStorage.getToken()) {
      tokenStorage.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
  },
);

/** Turns any Axios / network error into a readable message. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return 'Cannot reach the server. Is the backend running on port 8080?';
    }
    const data = error.response.data as Partial<ApiError> | undefined;
    if (data?.validationErrors && Object.keys(data.validationErrors).length > 0) {
      return Object.values(data.validationErrors).join(' • ');
    }
    if (data?.message) {
      return data.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

/** Field -> message map from a 400 validation response (for showing errors next to inputs). */
export function getFieldErrors(error: unknown): Record<string, string> {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiError> | undefined;
    return data?.validationErrors ?? {};
  }
  return {};
}

export function getStatusCode(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined;
}

export default api;
