import type { TQueryKey } from "@mercado/shared-ui";

export const loginEndpoint = {
  url: "/store/auth/login",
};

export const registerEndpoint = {
  url: "/store/auth/register",
};

export const meEndpoint = {
  queryKey: [["store", "auth", "me"]] as TQueryKey,
  url: "/store/auth/me",
};

export const updateProfileEndpoint = {
  url: "/store/auth/me",
};
