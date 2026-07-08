export type OrderStatusFilter =
  | "all"
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface AccountNavItem {
  id: string;
  label: string;
  to: string;
  end?: boolean;
  external?: boolean;
  children?: { label: string; to: string; status: OrderStatusFilter }[];
}

/** Sidebar items backed by store API or existing store-web features. */
export const accountNavItems: AccountNavItem[] = [
  {
    id: "orders",
    label: "Your orders",
    to: "/account/orders",
    children: [
      { label: "All orders", to: "/account/orders", status: "all" },
      { label: "Pending", to: "/account/orders?status=pending", status: "pending" },
      { label: "Confirmed", to: "/account/orders?status=confirmed", status: "confirmed" },
      { label: "Packed", to: "/account/orders?status=packed", status: "packed" },
      { label: "Shipped", to: "/account/orders?status=shipped", status: "shipped" },
      { label: "Delivered", to: "/account/orders?status=delivered", status: "delivered" },
      { label: "Cancelled", to: "/account/orders?status=cancelled", status: "cancelled" },
    ],
  },
  {
    id: "reviews",
    label: "Your reviews",
    to: "/account/reviews",
  },
  {
    id: "messages",
    label: "Messages",
    to: "/account/messages",
  },
  {
    id: "addresses",
    label: "Shipping addresses",
    to: "/account/addresses",
  },
  {
    id: "cart",
    label: "Your cart",
    to: "/cart",
    external: true,
  },
  {
    id: "profile",
    label: "Your profile",
    to: "/account/profile",
    end: true,
  },
];

export const orderStatusTabs: { label: string; status: OrderStatusFilter }[] = [
  { label: "All orders", status: "all" },
  { label: "Pending", status: "pending" },
  { label: "Confirmed", status: "confirmed" },
  { label: "Packed", status: "packed" },
  { label: "Shipped", status: "shipped" },
  { label: "Delivered", status: "delivered" },
  { label: "Cancelled", status: "cancelled" },
];
