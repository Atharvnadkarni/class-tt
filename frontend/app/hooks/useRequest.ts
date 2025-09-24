import { logout } from "@/context/userSlice";
import axios, { AxiosRequestConfig } from "axios";
import { useRouter } from "next/navigation";

export interface UseRequestOptions {
  baseURL?: string;
  token?: string;
}

import { useState, useCallback } from "react";
import { useDispatch } from "react-redux";

export const useRequest = (options: UseRequestOptions = {}) => {
  const baseURL = options.baseURL || "schedulr-backend.netlify.appapi";
  let token = "";
  if (typeof window !== "undefined") {
    const userStr = window.localStorage.getItem("user");
    if (userStr) {
      try {
        token = JSON.parse(userStr).token;
      } catch {}
    }
  }
  const getAuthHeaders = () =>
    token ? { Authorization: `Bearer ${token}` } : {};

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();

  // Helper for requests
  const request = useCallback(
    async <T = any>(
      method: AxiosRequestConfig["method"],
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ) => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios({
          method,
          url: `${baseURL}${url}`,
          data,
          headers: { ...getAuthHeaders(), ...(config?.headers || {}) },
          ...config,
        });
        return res;
      } catch (err: any) {
        if (err?.response?.status == 401) {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("user");
          }
          dispatch(logout());
          router.push("/login");
        }
        setError(err?.response?.data?.error || err.message || "Unknown error");
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [baseURL, token]
  );

  // Teacher Requests

  // Substitution Requests
  return { request, isLoading, error };
};
