import type { PrismaClient } from "../../../generated/prisma/client";

/** Prisma client or interactive transaction client (model delegates only). */
export type DbClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends" | "$use"
>;
