import type { TQueryKey } from "@mercado/shared-ui";

export const loginEndpoint = {
  url: "/auth/login",
};

export const registerEndpoint = {
  url: "/auth/register",
};

export const meEndpoint = {
  queryKey: [["store", "auth", "me"]] as TQueryKey,
  url: "/auth/me",
};

export const updateProfileEndpoint = {
  url: "/auth/me",
};
