import crypto from "node:crypto";
import { isProd } from "./config.js";

// Zero-dependency auth helpers: scrypt password hashing + HMAC-signed tokens.
// The token travels in an httpOnly cookie, so page scripts (XSS) cannot read it.
const secret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (isProd()) throw new Error("JWT_SECRET is required in production");
  return "dev-only-change-me";
};
const TTL_MS = 1000 * 60 * 60 * 12; // 12h

export const COOKIE_NAME = "hash_token";

// httpOnly  -> JavaScript cannot read the cookie (blocks token theft via XSS)
// secure    -> sent over HTTPS only
// sameSite  -> "lax"/"strict" stops the browser attaching the cookie to requests
//              started by other sites (CSRF). Frontend and API on different
//              domains (Netlify + Render) need "none"; the Origin check in
//              app.js then provides the CSRF protection.
export function cookieOptions() {
  const sameSite = (process.env.COOKIE_SAMESITE || (isProd() ? "none" : "lax")).toLowerCase();
  return {
    httpOnly: true,
    secure: isProd() || sameSite === "none",
    sameSite,
    maxAge: TTL_MS,
    path: "/",
  };
}

export const setAuthCookie = (res, user) => res.cookie(COOKIE_NAME, signToken(user), cookieOptions());
export const clearAuthCookie = (res) => {
  const { maxAge, ...opts } = cookieOptions();
  res.clearCookie(COOKIE_NAME, opts);
};

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, "hex");
  const b = crypto.scryptSync(password, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const sign = (data) => crypto.createHmac("sha256", secret()).update(data).digest("base64url");

export function signToken(user) {
  const body = b64({ sub: String(user._id), role: user.role, exp: Date.now() + TTL_MS });
  return `${body}.${sign(body)}`;
}

export function readToken(token) {
  const [body, sig] = String(token || "").split(".");
  if (!body || !sig) return null;
  const expected = sign(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString());
    return p.exp > Date.now() ? p : null;
  } catch {
    return null;
  }
}

// Cookie first (browsers); Bearer header still works for Postman / scripts.
function fromRequest(req) {
  const c = req.cookies?.[COOKIE_NAME];
  if (c) return readToken(c);
  const h = req.get("authorization") || "";
  return h.startsWith("Bearer ") ? readToken(h.slice(7)) : null;
}

export function requireAuth(req, res, next) {
  const p = fromRequest(req);
  if (!p) return res.status(401).json({ error: "Login required" });
  req.auth = p;
  next();
}

// Optional legacy API key for scripts. Only active when ADMIN_KEY is set in the
// environment (no built-in default) and compared in constant time.
function adminKeyOk(req) {
  const given = req.get("x-admin-key");
  const want = process.env.ADMIN_KEY;
  if (!given || !want) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(want);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function requireAdmin(req, res, next) {
  const p = fromRequest(req);
  if (p?.role === "admin") {
    req.auth = p;
    return next();
  }
  if (adminKeyOk(req)) return next();
  res.status(401).json({ error: "Unauthorized" });
}
