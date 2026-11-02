// Run with: npm test   (uses Node's built-in test runner; no database needed)
import { test, before, after } from "node:test";
import assert from "node:assert/strict";

process.env.JWT_SECRET = "test-secret-test-secret-test-secret-123";
process.env.CORS_ORIGIN = "https://hash-frontend.example";
delete process.env.NODE_ENV;

const { createApp } = await import("../src/app.js");
const auth = await import("../src/auth.js");
const { assertProductionConfig } = await import("../src/config.js");

let server;
let base;

before(async () => {
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => server.close());

const post = (path, body, headers = {}) =>
  fetch(base + path, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

// ---------- security headers (Helmet) ----------
test("health endpoint works and sends Helmet security headers", async () => {
  const res = await fetch(base + "/health");
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-content-type-options"), "nosniff");
  assert.ok(res.headers.get("content-security-policy"), "CSP header missing");
  assert.ok(res.headers.get("strict-transport-security"), "HSTS header missing");
  assert.equal(res.headers.get("x-powered-by"), null, "X-Powered-By must be hidden");
});

// ---------- NoSQL injection ----------
test("NoSQL operator objects in the login body are rejected (no bypass)", async () => {
  const res = await post("/auth/login", { email: { $ne: null }, password: { $ne: null } });
  assert.equal(res.status, 400);
});

test("operator objects are rejected on admin login and signup too", async () => {
  assert.equal((await post("/auth/admin/login", { email: { $gt: "" }, password: { $gt: "" } })).status, 400);
  assert.equal((await post("/auth/signup", { name: "x", email: { $ne: 1 }, password: "password123" })).status, 400);
});

// ---------- input validation ----------
test("feedback must be a plain string", async () => {
  const res = await post("/feedback", { message: { $ne: "" } });
  assert.equal(res.status, 400);
});

test("empty and over-long feedback is rejected", async () => {
  assert.equal((await post("/feedback", { message: "   " })).status, 400);
  assert.equal((await post("/feedback", { message: "a".repeat(501) })).status, 400);
});

test("malformed JSON gives 400 and oversized body gives 413", async () => {
  assert.equal((await post("/feedback", "{not json")).status, 400);
  assert.equal((await post("/feedback", { message: "a".repeat(20000) })).status, 413);
});

// ---------- CSRF / CORS ----------
test("cross-site POST from an unknown origin is blocked (CSRF)", async () => {
  const res = await post("/auth/login", { email: "a@b.co", password: "x" }, { Origin: "https://evil.example" });
  assert.equal(res.status, 403);
});

test("CORS allows only the configured frontend origin, with credentials", async () => {
  const ok = await fetch(base + "/health", { headers: { Origin: "https://hash-frontend.example" } });
  assert.equal(ok.headers.get("access-control-allow-origin"), "https://hash-frontend.example");
  assert.equal(ok.headers.get("access-control-allow-credentials"), "true");
  const bad = await fetch(base + "/health", { headers: { Origin: "https://evil.example" } });
  assert.equal(bad.headers.get("access-control-allow-origin"), null);
});

// ---------- auth ----------
test("protected routes need a login", async () => {
  assert.equal((await fetch(base + "/auth/me")).status, 401);
  assert.equal((await fetch(base + "/admin/summary")).status, 401);
  assert.equal((await fetch(base + "/registrations")).status, 401);
});

test("password hashing and token signing", () => {
  const stored = auth.hashPassword("correct horse");
  assert.ok(auth.verifyPassword("correct horse", stored));
  assert.ok(!auth.verifyPassword("wrong", stored));
  const token = auth.signToken({ _id: "abc123", role: "user" });
  assert.equal(auth.readToken(token).sub, "abc123");
  assert.equal(auth.readToken(token.slice(0, -2) + "xx"), null, "tampered token must be rejected");
  assert.equal(auth.readToken("garbage"), null);
});

test("auth middleware reads the httpOnly cookie", () => {
  const token = auth.signToken({ _id: "u1", role: "admin" });
  const req = { cookies: { [auth.COOKIE_NAME]: token }, get: () => "" };
  let nextCalled = false;
  auth.requireAdmin(req, { status: () => ({ json: () => {} }) }, () => (nextCalled = true));
  assert.ok(nextCalled);
  assert.equal(req.auth.role, "admin");
});

test("auth cookie is httpOnly + secure + sameSite in production", () => {
  const prev = { ...process.env };
  process.env.NODE_ENV = "production";
  delete process.env.COOKIE_SAMESITE;
  const o = auth.cookieOptions();
  assert.equal(o.httpOnly, true);
  assert.equal(o.secure, true);
  assert.equal(o.sameSite, "none"); // frontend and API on different domains
  process.env.COOKIE_SAMESITE = "strict";
  assert.equal(auth.cookieOptions().sameSite, "strict");
  process.env.NODE_ENV = prev.NODE_ENV ?? "";
  if (prev.NODE_ENV === undefined) delete process.env.NODE_ENV;
  if (prev.COOKIE_SAMESITE === undefined) delete process.env.COOKIE_SAMESITE;
});

// ---------- production config guard ----------
test("production refuses default secrets, accepts strong ones", () => {
  assert.throws(() => assertProductionConfig({ NODE_ENV: "production", JWT_SECRET: "change-this-long-random-string" }));
  assert.doesNotThrow(() =>
    assertProductionConfig({
      NODE_ENV: "production",
      JWT_SECRET: "x".repeat(40),
      ADMIN_PASSWORD: "a-strong-admin-pass-1",
      MONGODB_URI: "mongodb+srv://u:p@cluster.example/hash",
      CORS_ORIGIN: "https://hash-frontend.example",
    })
  );
});

// ---------- rate limiting (keep last: it exhausts the login limiter) ----------
test("repeated failed logins are rate limited (brute-force protection)", async () => {
  let last;
  for (let i = 0; i < 12; i++) last = await post("/auth/login", { email: "a@b.co" }); // 400s count as failures
  assert.equal(last.status, 429);
});
