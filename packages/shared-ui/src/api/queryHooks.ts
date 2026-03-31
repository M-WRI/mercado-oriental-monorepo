import { useMutation, useQuery, type UseMutationResult, type UseQueryResult } from "@tanstack/react-query";
import type { ErrorResponse, TQueryKey, TQueryOptions } from "../types";
import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export const useFetch = <TResponse>({
  queryKey,
  url,
  headers,
  options,
  enabled,
  serializer,
}: {
  queryKey: TQueryKey;
  url: string;
  headers?: Record<string, string>;
  options?: TQueryOptions<TResponse>;
  enabled?: boolean;
  serializer?: {
    response: (data: TResponse) => TResponse;
  };
}): Omit<UseQueryResult<TResponse, ErrorResponse>, "data"> & {
  data: TResponse | undefined;
} => {
  const resolvedEnabled = enabled !== undefined ? enabled : (options as { enabled?: boolean } | undefined)?.enabled ?? true;

  const { data, ...rest } = useQuery<TResponse, ErrorResponse, TResponse, TQueryKey>({
    queryKey,
    queryFn: () => apiGet<TResponse>(url, headers),
    ...options,
    enabled: resolvedEnabled,
  });

  const transformedData = data && serializer?.response ? serializer.response(data) : data;
  return { ...rest, data: transformedData };
};

export const usePost = <TVariables, TResponse>({
  headers,
  serializer,
}: {
  headers?: Record<string, string>;
  serializer?: {
    request?: (data: TVariables) => TVariables;
    response?: (data: TResponse) => TResponse;
  };
} = {}): UseMutationResult<TResponse, ErrorResponse, { url: string; data: TVariables }> =>
  useMutation<TResponse, ErrorResponse, { url: string; data: TVariables }>({
    mutationFn: async ({ url, data }) => {
      const response = await apiPost<TVariables, TResponse>(url, serializer?.request ? serializer.request(data) : data, headers);
      return serializer?.response ? serializer.response(response) : response;
    },
  });

export const usePatch = <TVariables, TResponse>({
  headers,
  serializer,
}: {
  headers?: Record<string, string>;
  serializer?: {
    request: (data: TVariables) => TVariables;
    response: (data: TResponse) => TResponse;
  };
} = {}): UseMutationResult<TResponse, ErrorResponse, { url: string; data: TVariables }> =>
  useMutation<TResponse, ErrorResponse, { url: string; data: TVariables }>({
    mutationFn: async ({ url, data }) => {
      const response = await apiPatch<TVariables, TResponse>(url, serializer?.request ? serializer.request(data) : data, headers);
      return serializer?.response ? serializer.response(response) : response;
    },
  });

export const useDelete = <TVariables, TResponse>({
  headers,
}: {
  headers?: Record<string, string>;
} = {}): UseMutationResult<TResponse, ErrorResponse, { url: string; data?: TVariables }> =>
  useMutation<TResponse, ErrorResponse, { url: string; data?: TVariables }>({
    mutationFn: async ({ url, data }) => apiDelete<TResponse>(url, headers, data),
  });
