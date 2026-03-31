import express from "express";
import cors from "cors";
import authRoutes from "./_modules/auth/routes";
import shopRoutes from "./_modules/shop/routes";
import attributeRoutes from "./_modules/attributes/routes";
import productRoutes from "./_modules/products/routes";
import dashboardRoutes from "./_modules/dashboard/routes";
import orderRoutes from "./_modules/orders/routes";
import inventoryRoutes from "./_modules/inventory/routes";
import notificationsRoutes from "./_modules/notifications/routes";
import touchpointsRoutes from "./_modules/touchpoints/routes";
import reviewsRoutes from "./_modules/reviews/routes";
import storeAuthRoutes from "./_modules/store-auth/routes";
import { authMiddleware } from "./middleware/authMiddleware";
import { errorMiddleware } from "./middleware/errorMiddleware";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  app.use("/api/auth", authRoutes);
  app.use("/api/store/auth", storeAuthRoutes);
  app.use("/api/shops", authMiddleware, shopRoutes);
  app.use("/api/attributes", authMiddleware, attributeRoutes);
  app.use("/api/products", authMiddleware, productRoutes);
  app.use("/api/dashboard", authMiddleware, dashboardRoutes);
  app.use("/api/orders", authMiddleware, orderRoutes);
  app.use("/api/inventory", authMiddleware, inventoryRoutes);
  app.use("/api/notifications", authMiddleware, notificationsRoutes);
  app.use("/api/touchpoints", authMiddleware, touchpointsRoutes);
  app.use("/api/reviews", authMiddleware, reviewsRoutes);

  app.use(errorMiddleware);

  return app;
}
