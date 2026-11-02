import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import compression from "compression";
import rateLimit from "express-rate-limit";
import router from "./routes.js";
import { allowedOrigins } from "./config.js";

const limiter = (limit, windowMs, extra = {}) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
    ...extra,
  });

// CSRF defence for cookie auth. Browsers always send an Origin header on
// cross-site POST/PUT/DELETE, so a request coming from any site other than our
// frontend is rejected. (sameSite cookies are the first layer; this is the second.)
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
export const csrfGuard = (origins) => (req, res, next) => {
  if (SAFE_METHODS.has(req.method)) return next();
  const origin = req.get("origin");
  if (origin && !origins.includes(origin)) return res.status(403).json({ error: "Cross-site request blocked" });
  next();
};

// Built in a function (not at import time) so tests can set env vars first.
export function createApp() {
  const app = express();
  const origins = allowedOrigins();

  // Render / Netlify sit behind proxies: needed for the real client IP (rate limits) and secure cookies.
  // TRUST_PROXY = number of proxy hops in front of the app (1 = Render only, 2 = Netlify proxy -> Render).
  app.set("trust proxy", Number(process.env.TRUST_PROXY) || 1);

  // Security headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options, hides X-Powered-By ...
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression()); // gzip JSON responses
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || origins.includes(origin)),
      credentials: true, // allow the httpOnly cookie to be sent from the frontend
    })
  );
  app.use(csrfGuard(origins));
  app.use(express.json({ limit: "10kb" })); // reject oversized bodies
  app.use(cookieParser());
  // Strips keys that start with "$" or contain "." from body/query/params,
  // so {"email": {"$ne": null}} can't reach MongoDB as an operator.
  app.use(
    mongoSanitize({
      onSanitize: ({ req, key }) => console.warn(`[security] NoSQL operator removed from "${key}" (ip ${req.ip})`),
    })
  );

  // Rate limits (brute force / spam protection)
  app.use("/api", limiter(300, 15 * 60 * 1000));
  app.use(["/api/auth/login", "/api/auth/signup", "/api/auth/admin/login"], limiter(10, 15 * 60 * 1000, { skipSuccessfulRequests: true }));
  app.post("/api/feedback", limiter(10, 60 * 60 * 1000));
  app.post("/api/events/:id/reserve", limiter(30, 15 * 60 * 1000));

  app.use("/api", router);

  app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));
  app.use((err, _req, res, _next) => {
    if (err.type === "entity.parse.failed") return res.status(400).json({ error: "Invalid JSON" });
    if (err.type === "entity.too.large") return res.status(413).json({ error: "Request too large" });
    console.error(err);
    res.status(500).json({ error: "Server error" });
  });

  return app;
}
