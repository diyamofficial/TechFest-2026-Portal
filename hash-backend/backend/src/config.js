// Production safety checks. In production the server refuses to start with
// missing or default secrets (the dev defaults are public in the source code).
const DEFAULT_SECRETS = new Set(["change-this-long-random-string", "dev-only-change-me", "changeme", "admin123"]);

export const isProd = () => process.env.NODE_ENV === "production";

export function assertProductionConfig(env = process.env) {
  if (env.NODE_ENV !== "production") return;
  const problems = [];
  const jwt = env.JWT_SECRET || "";
  if (jwt.length < 32 || DEFAULT_SECRETS.has(jwt)) problems.push("JWT_SECRET must be a random string of 32+ characters");
  const pw = env.ADMIN_PASSWORD || "";
  if (pw.length < 10 || DEFAULT_SECRETS.has(pw)) problems.push("ADMIN_PASSWORD must be set (10+ characters, not the default)");
  if (!env.MONGODB_URI) problems.push("MONGODB_URI must be set (use your Atlas connection string)");
  if (!env.CORS_ORIGIN) problems.push("CORS_ORIGIN must be set to your frontend URL");
  if (env.ADMIN_KEY && (env.ADMIN_KEY.length < 16 || DEFAULT_SECRETS.has(env.ADMIN_KEY)))
    problems.push("ADMIN_KEY, if set, must be 16+ characters (or remove it)");
  if (problems.length) {
    throw new Error("Unsafe production configuration:\n - " + problems.join("\n - "));
  }
}

// CORS_ORIGIN may hold several comma-separated origins.
export const allowedOrigins = () =>
  (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim().replace(/\/$/, ""))
    .filter(Boolean);
