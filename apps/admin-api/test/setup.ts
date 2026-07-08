import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

process.env.ALLOW_LEGACY_ORDERS ??= "true";
