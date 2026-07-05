export type NotificationBadgeVariant = "default" | "success" | "warning" | "danger" | "info";

export type NotificationTypeBadge = {
  label: string;
  variant: NotificationBadgeVariant;
};

export function getNotificationTypeBadge(
  type: string,
  t: (key: string) => string
): NotificationTypeBadge {
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
