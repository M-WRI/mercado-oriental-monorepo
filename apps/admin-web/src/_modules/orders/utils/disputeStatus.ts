import type { DisputeStatus } from "@/_modules/touchpoints/types";

export const DISPUTE_STATUS_VARIANT: Record<
  DisputeStatus,
  "default" | "warning" | "info" | "success" | "danger"
> = {
  open: "danger",
  under_review: "warning",
  resolved: "success",
  closed: "default",
};

export const NEXT_DISPUTE_STATUS: Partial<
  Record<DisputeStatus, { value: DisputeStatus; label: string }>
> = {
  open: { value: "under_review", label: "touchpoints.startReview" },
  under_review: { value: "resolved", label: "touchpoints.resolve" },
};
