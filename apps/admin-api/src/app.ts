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
import storeProductRoutes from "./_modules/store-products/routes";
import storeOrderRoutes from "./_modules/store-orders/routes";
import { authMiddleware } from "./middleware/authMiddleware";
import { errorMiddleware } from "./middleware/errorMiddleware";

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cors());

  const adminRouter = express.Router();
  adminRouter.use("/auth", authRoutes);

  const protectedAdminRouter = express.Router();
  protectedAdminRouter.use(authMiddleware);
  protectedAdminRouter.use("/shops", shopRoutes);
  protectedAdminRouter.use("/attributes", attributeRoutes);
  protectedAdminRouter.use("/products", productRoutes);
  protectedAdminRouter.use("/dashboard", dashboardRoutes);
  protectedAdminRouter.use("/orders", orderRoutes);
  protectedAdminRouter.use("/inventory", inventoryRoutes);
  protectedAdminRouter.use("/notifications", notificationsRoutes);
  protectedAdminRouter.use("/touchpoints", touchpointsRoutes);
  protectedAdminRouter.use("/reviews", reviewsRoutes);

  adminRouter.use(protectedAdminRouter);

  const storeRouter = express.Router();
  storeRouter.use("/auth", storeAuthRoutes);
  storeRouter.use("/products", storeProductRoutes);
  storeRouter.use("/orders", storeOrderRoutes);

  app.use("/api/admin", adminRouter);
  app.use("/api/store", storeRouter);

  app.use(errorMiddleware);

  return app;
}
