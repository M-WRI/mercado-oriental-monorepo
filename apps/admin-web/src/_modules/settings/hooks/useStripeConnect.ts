import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePost } from "@/_shared/queryProvider";
import { useToast } from "@mercado/shared-ui";
import { createStripeConnect, getStripeConnectStatus } from "@/_modules/shops/api/stripe";
import { useShop } from "@/_modules/shops/context/ShopProvider";

export interface StripeConnectStatus {
  connected: boolean;
  onboardingComplete: boolean;
  chargesEnabled?: boolean;
  detailsSubmitted?: boolean;
}

export function useStripeConnect() {
  const { t } = useTranslation();
  const { shopId } = useShop();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isConnecting, setIsConnecting] = useState(false);

  const { data: status, isLoading, refetch } = useFetch<StripeConnectStatus>({
    queryKey: getStripeConnectStatus.queryKey(shopId),
    url: getStripeConnectStatus.url(shopId),
  });

  const { mutate: connect } = usePost<{ url: string }>();

  useEffect(() => {
    const stripeReturn = searchParams.get("stripe");
    if (stripeReturn === "return") {
      toastSuccess(t("settings.stripeReturnSuccess"));
      refetch();
      searchParams.delete("stripe");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams, refetch, toastSuccess, t]);

  const startConnect = () => {
    setIsConnecting(true);
    connect(
      { url: createStripeConnect.url(shopId), data: {} },
      {
        onSuccess: (data) => {
          if (data.url) {
            window.location.href = data.url;
          }
        },
        onSettled: () => setIsConnecting(false),
      }
    );
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getStripeConnectStatus.queryKey(shopId) });
    refetch();
  };

  return {
    status,
    isLoading,
    isConnecting,
    startConnect,
    refresh,
  };
}
