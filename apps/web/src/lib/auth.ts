import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/client";
import { nextCookies } from "better-auth/next-js";
import * as schema from "@/db/schema";
export const auth = betterAuth({
  emailAndPassword: {
    requireEmailVerification: false,
    enabled: true,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
    },
  }),
  plugins: [nextCookies()],
});
