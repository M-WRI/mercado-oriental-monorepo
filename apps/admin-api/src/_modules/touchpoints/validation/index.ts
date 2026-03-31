const VALID_SENDERS = new Set(["vendor", "customer"]);
const VALID_DISPUTE_STATUSES = new Set(["open", "under_review", "resolved", "closed"]);

const DISPUTE_TRANSITIONS: Record<string, Set<string>> = {
  open: new Set(["under_review", "closed"]),
  under_review: new Set(["resolved", "closed"]),
  resolved: new Set(["closed"]),
  closed: new Set(),
};

export function isValidSender(sender: unknown): sender is string {
  return typeof sender === "string" && VALID_SENDERS.has(sender);
}

export function isValidDisputeStatus(status: unknown): status is string {
  return typeof status === "string" && VALID_DISPUTE_STATUSES.has(status);
}

export function isValidDisputeTransition(current: string, next: string): boolean {
  return DISPUTE_TRANSITIONS[current]?.has(next) ?? false;
}
