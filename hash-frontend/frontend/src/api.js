import { useEffect, useState } from "react";

// Backend base URL. In dev, Vite proxies /api to http://localhost:5000.
// For a deployed backend, set VITE_API_URL (e.g. https://hash-api.onrender.com/api).
const BASE = import.meta.env.VITE_API_URL || "/api";

// The login token lives in an httpOnly cookie set by the server, so JavaScript
// (and therefore any injected script) can never read it. "credentials: include"
// makes the browser send that cookie to the API.
// SESSION_FLAG is only a non-secret hint ("a session probably exists") so we skip
// the /auth/me call for first-time visitors.
export const SESSION_FLAG = "hash_session";

const opts = (extra = {}) => ({ credentials: "include", ...extra });

export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, opts());
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(
    `${BASE}${path}`,
    opts({
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  );
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// GET that returns { ok, status, data } instead of throwing (for auth/admin calls).
export async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`, opts());
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// Fetches `path` from the backend; keeps `fallback` (the bundled data) if the
// backend is unreachable so the page still renders.
export function useApi(path, fallback) {
  const [data, setData] = useState(fallback);
  useEffect(() => {
    let cancelled = false;
    apiGet(path)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [path]);
  return data;
}
