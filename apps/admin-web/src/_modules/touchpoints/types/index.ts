export interface IOrderMessage {
  id: string;
  orderId: string;
  sender: "vendor" | "customer";
  body: string;
  createdAt: string;
}

export type DisputeStatus = "open" | "under_review" | "resolved" | "closed";

export interface IDispute {
  id: string;
  orderId: string;
  reason: string;
  status: DisputeStatus;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  order: {
    id: string;
    customerEmail: string;
    customerName: string | null;
    status: string;
  };
  messages: IDisputeMessage[];
  _count?: { messages: number };
}

export interface IDisputeMessage {
  id: string;
  disputeId: string;
  sender: "vendor" | "customer";
  body: string;
  createdAt: string;
}
