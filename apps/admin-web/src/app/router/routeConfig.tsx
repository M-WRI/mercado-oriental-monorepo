import { MdOutlineCategory, MdOutlineReceipt, MdOutlineShoppingCart, MdOutlineSpaceDashboard } from "react-icons/md";
import { AttributeDetail, AttributesList, EditAttribute } from "@/_modules/attributes/screens";
import { DashboardScreen } from "@/_modules/dashboard/screens";
import { NotificationsList } from "@/_modules/notifications/screens";
import { OrderDetail, OrderList } from "@/_modules/orders/screens";
import { ProductList } from "@/_modules/products/screens/ProductList";
import { CreateProduct } from "@/_modules/products/screens/createProduct";
import { EditProduct } from "@/_modules/products/screens/editProduct";
import { ProductDetail } from "@/_modules/products/screens/productDetail";
import type { TRouteConfig } from "../types/routes";

export const routeConfig: TRouteConfig[] | undefined = [
  {
    index: true,
    Component: DashboardScreen,
    labelKey: "nav.dashboard",
    label: "Dashboard",
    icon: <MdOutlineSpaceDashboard size={20} />,
    showInSidebar: true,
  },
  {
    path: "attributes",
    children: [
      { index: true, Component: AttributesList },
      { path: ":id/edit", Component: EditAttribute },
      { path: ":id", Component: AttributeDetail },
    ],
    showInSidebar: true,
    labelKey: "nav.attributes",
    label: "Attributes",
    icon: <MdOutlineCategory size={20} />,
  },
  {
    path: "products",
    children: [
      { index: true, Component: ProductList },
      { path: "create", Component: CreateProduct },
      { path: ":id/edit", Component: EditProduct },
      { path: ":id", Component: ProductDetail },
    ],
    showInSidebar: true,
    labelKey: "nav.products",
    label: "Products",
    icon: <MdOutlineShoppingCart size={20} />,
  },
  {
    path: "orders",
    children: [
      { index: true, Component: OrderList },
      { path: ":id", Component: OrderDetail },
    ],
    showInSidebar: true,
    labelKey: "nav.orders",
    label: "Orders",
    icon: <MdOutlineReceipt size={20} />,
  },
  {
    path: "notifications",
    children: [{ index: true, Component: NotificationsList }],
    showInSidebar: false,
    labelKey: "nav.notifications",
    label: "Notifications",
    icon: <MdOutlineReceipt size={20} />,
  },
];
