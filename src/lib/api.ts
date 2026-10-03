import { useAuthStore } from "@/store/auth.store";
import { API_URL, API_KEY } from "@/utils";
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export { API_URL };

// Custom config to specify auth mode
export type AuthMode = "none" | "auth" | "temp-auth";

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  authMode?: AuthMode;
}

// Main API instance
export const api = axios.create({
  baseURL: API_URL,
});

// Request interceptor - handles different auth modes
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig & { authMode?: AuthMode }) => {
    const authMode = config.authMode || "none";

    // Always add X-API-Key header
    config.headers["X-API-Key"] = API_KEY;

    // Handle different auth modes
    switch (authMode) {
      case "auth": {
        // Standard authenticated request - use access token
        const token = useAuthStore.getState().accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        break;
      }

      case "temp-auth": {
        // Temporary authentication - use temp token (for onboarding/callback)
        const tempToken = useAuthStore.getState().tempToken;
        if (tempToken) {
          config.headers.Authorization = `Bearer ${tempToken}`;
        }
        break;
      }

      case "none":
      default:
        // No authentication - only X-API-Key
        break;
    }

    return config;
  },
);

// Singleton refresh promise — prevents concurrent 401s from rotating the refresh
// token multiple times, which causes all-but-one to fail and log the user out.
let _refreshPromise: Promise<{
  accessToken: string;
  refreshToken: string;
} | null> | null = null;

// Response interceptor - handles token refresh for 'auth' mode
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 'auth' mode requests
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.authMode === "auth"
    ) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // If a refresh is already in-flight, await it instead of starting a new one.
        // All concurrent 401s share one refresh call — only one token rotation happens.
        if (!_refreshPromise) {
          _refreshPromise = useAuthStore
            .getState()
            .refreshTokens()
            .finally(() => {
              _refreshPromise = null;
            });
        }

        const newTokens = await _refreshPromise;

        if (!newTokens) {
          throw new Error("Token refresh failed");
        }

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// Helper function to make authenticated requests
export const authRequest = <T = any>(config: CustomAxiosRequestConfig) => {
  return api.request<T>({ ...config, authMode: "auth" } as CustomAxiosRequestConfig);
};

// Helper function to make temp-auth requests (onboarding/callback)
export const tempAuthRequest = <T = any>(config: CustomAxiosRequestConfig) => {
  return api.request<T>({ ...config, authMode: "temp-auth" } as CustomAxiosRequestConfig);
};
