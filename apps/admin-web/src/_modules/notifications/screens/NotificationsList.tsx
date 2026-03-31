import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePatch } from "@/_shared/queryProvider";
import { Button, Card, Tag } from "@mercado/shared-ui";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../api";
import type { INotification } from "../types";

function typeBadge(
  type: string,
  t: (key: string) => string
): { label: string; variant: "default" | "success" | "warning" | "danger" | "info" } {
  switch (type) {
    case "LOW_STOCK":
      return { label: t("notifications.types.LOW_STOCK"), variant: "warning" };
    case "NEW_ORDER":
      return { label: t("notifications.types.NEW_ORDER"), variant: "success" };
    case "PAYMENT_FAILED":
      return { label: t("notifications.types.PAYMENT_FAILED"), variant: "danger" };
    case "NEW_MESSAGE":
      return { label: t("notifications.types.NEW_MESSAGE"), variant: "info" };
    case "NEW_DISPUTE":
      return { label: t("notifications.types.NEW_DISPUTE"), variant: "danger" };
    case "DISPUTE_STATUS_CHANGE":
      return { label: t("notifications.types.DISPUTE_STATUS_CHANGE"), variant: "warning" };
    case "NEW_REVIEW":
      return { label: t("notifications.types.NEW_REVIEW"), variant: "success" };
    default:
      return { label: type, variant: "default" };
  }
}

export const NotificationsList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: items } = useFetch<INotification[]>({
    queryKey: getNotifications.queryKey,
    url: getNotifications.url,
  });

  const { mutate: patchRead } = usePatch();
  const { mutate: patchAll, isPending: isMarkingAll } = usePatch();

  const unread = (items ?? []).filter((n) => !n.readAt);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-8">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h4 className="text-lg font-semibold text-gray-900">{t("notifications.title")}</h4>
        <Button
          style="primaryOutline"
          disabled={unread.length === 0 || isMarkingAll}
          onClick={() =>
            patchAll(
              { url: markAllNotificationsRead.url, data: {} },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: getNotifications.queryKey });
                },
              }
            )
          }
        >
          {t("notifications.markAllRead")}
        </Button>
      </div>

      <div className="space-y-3">
        {(items ?? []).length === 0 && (
          <p className="text-sm text-gray-400">{t("notifications.empty")}</p>
        )}
        {(items ?? []).map((n) => {
          const badge = typeBadge(n.type, t);
          return (
          <Card key={n.id} className={n.readAt ? "opacity-60" : ""}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag variant={badge.variant} className="!text-[10px] uppercase tracking-wide">
                    {badge.label}
                  </Tag>
                </div>
                <p className="text-sm font-medium text-gray-900 mt-2">{n.title}</p>
                <p className="text-sm text-gray-600 mt-1">{n.body}</p>
                <p className="text-xs text-gray-400 mt-2">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.readAt && (
                <Button
                  style="link"
                  className="!text-xs shrink-0"
                  onClick={() =>
                    patchRead(
                      { url: markNotificationRead.url(n.id), data: {} },
                      {
                        onSuccess: () => {
                          queryClient.invalidateQueries({ queryKey: getNotifications.queryKey });
                        },
                      }
                    )
                  }
                >
                  {t("notifications.markRead")}
                </Button>
              )}
            </div>
          </Card>
          );
        })}
      </div>
    </div>
  );
};
