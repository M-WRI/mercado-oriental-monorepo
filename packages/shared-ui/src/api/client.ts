import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import type { ErrorResponse } from "../types/error";

type ErrorMessageSerializer = (error: unknown) => string;

interface ApiClientConfig {
  baseURL: string;
  getToken?: () => string | null;
  onUnauthorized?: () => void;
  serializeError?: ErrorMessageSerializer;
}

let axiosInstance: AxiosInstance | null = null;

export function initApiClient(config: ApiClientConfig) {
  axiosInstance = axios.create({
    baseURL: config.baseURL,
    headers: { "Content-Type": "application/json" },
  });

  axiosInstance.interceptors.request.use(
    async (req: InternalAxiosRequestConfig) => {
      const token = config.getToken?.();
      if (token) {
        req.headers.Authorization = `Bearer ${token}`;
      }
      return req;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: unknown) => {
      const axiosError = axios.isAxiosError(error) ? error : null;

      if (axiosError?.response?.status === 401) {
        config.onUnauthorized?.();
      }

      if (config.serializeError) {
        const message = config.serializeError(axiosError?.response?.data);
        window.dispatchEvent(
          new CustomEvent("app:toast", {
            detail: { message, variant: "error" },
          })
        );
      }

      return Promise.reject(error);
    }
  );
}

function getInstance() {
  if (!axiosInstance) {
    throw new Error("API client is not initialized. Call initApiClient() first.");
  }
  return axiosInstance;
}

function extractError<T>(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<T>;
    throw axiosError?.response?.data ?? { case: "unknown", code: "SERVER_ERROR" };
  }
  throw { case: "unknown", code: "SERVER_ERROR" };
}

export const apiGet = async <T>(url: string, headers?: Record<string, string>): Promise<T> => {
  try {
    const response = await getInstance().get<T>(url, { headers });
    return response.data;
  } catch (error) {
    extractError<T>(error);
  }
};

export const apiPost = async <TVariables extends any, TResponse = TVariables>(
  url: string,
  data: TVariables,
  headers: Record<string, string> = {}
): Promise<TResponse> => {
  try {
    const response = await getInstance().post<TResponse>(url, data, { headers });
    return response.data;
  } catch (error) {
    extractError<TResponse>(error);
  }
};

export const apiPatch = async <TVariables extends any, TResponse = TVariables>(
  url: string,
  data: TVariables,
  headers: Record<string, string> = {}
): Promise<TResponse> => {
  try {
    const response = await getInstance().patch<TResponse>(url, data, { headers });
    return response.data;
  } catch (error) {
    extractError<TResponse>(error);
  }
};

export const apiDelete = async <TResponse = any>(
  url: string,
  headers: Record<string, string> = {},
  data?: any
): Promise<TResponse> => {
  try {
    const response = await getInstance().delete<TResponse>(url, { headers, data });
    return response.data;
  } catch (error) {
    extractError<ErrorResponse>(error);
  }
};
