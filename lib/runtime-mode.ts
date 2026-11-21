const LOCAL_DEMO_SECRET = "tracelog-local-demo-secret-do-not-deploy";

export function isLocalDemoMode(): boolean {
  return process.env.TRACELOG_DEMO_MODE === "true"
    && process.env.NODE_ENV === "development"
    && !process.env.VERCEL
    && !process.env.VERCEL_ENV
    && !process.env.DATABASE_URL;
}

export function getAuthSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (secret && Buffer.byteLength(secret, "utf8") >= 32) return secret;
  if (!secret && isLocalDemoMode()) return LOCAL_DEMO_SECRET;
  throw new Error("BETTER_AUTH_SECRET must be configured with at least 32 characters.");
}
