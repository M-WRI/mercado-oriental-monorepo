import type { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";
import type { ErrorResponse } from "./error";

export type TQueryKey = [string[]];

export type TMutationOptions<TResponse, TVariables> = UseMutationOptions<
  TResponse,
  ErrorResponse,
  TVariables
>;

export type TQueryOptions<TResponse> = UseQueryOptions<
  TResponse,
  ErrorResponse,
  TResponse,
  TQueryKey
>;
