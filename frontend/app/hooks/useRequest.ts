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
  const baseURL = options.baseURL || "http://localhost:4000/api";
  const token = JSON.parse(localStorage.getItem("user")).token;
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
          localStorage.removeItem("user");
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
