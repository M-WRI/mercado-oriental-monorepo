import express from "express";
import cors from "cors";
import uploadRoutes from "./_modules/uploads/routes";
import { ensureUploadDirs, UPLOADS_ROOT } from "./lib/uploads";
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
import storeReviewRoutes from "./_modules/store-reviews/routes";
import storeMessageRoutes from "./_modules/store-messages/routes";
import storeShopRoutes from "./_modules/store-shops/routes";
import storeCategoryRoutes from "./_modules/store-categories/routes/store";
import adminCategoryRoutes from "./_modules/store-categories/routes/admin";
import { authMiddleware } from "./middleware/authMiddleware";
import { errorMiddleware } from "./middleware/errorMiddleware";

export function createApp() {
  const app = express();

  ensureUploadDirs();
  app.use(express.json());
  app.use(cors());
  app.use("/uploads", express.static(UPLOADS_ROOT));

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
  protectedAdminRouter.use("/categories", adminCategoryRoutes);
  protectedAdminRouter.use("/uploads", uploadRoutes);

  adminRouter.use(protectedAdminRouter);

  const storeRouter = express.Router();
  storeRouter.use("/auth", storeAuthRoutes);
  storeRouter.use("/products", storeProductRoutes);
  storeRouter.use("/shops", storeShopRoutes);
  storeRouter.use("/categories", storeCategoryRoutes);
  storeRouter.use("/orders", storeOrderRoutes);
  storeRouter.use(storeReviewRoutes);
  storeRouter.use(storeMessageRoutes);

  app.use("/api/admin", adminRouter);
  app.use("/api/store", storeRouter);

  app.use(errorMiddleware);

  return app;
}
