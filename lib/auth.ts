import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "./db";
import { getAuthSecret } from "./runtime-mode";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: getAuthSecret(),
  appName: "TraceLog",
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
  logger: {
    disabled: process.env.NODE_ENV === "production",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable email verification for now
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  plugins: [],
});
