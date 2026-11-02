import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, apiPost, SESSION_FLAG } from "../api";

const AuthContext = createContext();

const hasSessionHint = () => {
  try {
    return localStorage.getItem(SESSION_FLAG) === "1";
  } catch {
    return false;
  }
};
const setSessionHint = (on) => {
  try {
    if (on) localStorage.setItem(SESSION_FLAG, "1");
    else localStorage.removeItem(SESSION_FLAG);
  } catch {
    /* storage unavailable */
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(hasSessionHint());

  // Restore the session: the browser sends the httpOnly cookie automatically.
  useEffect(() => {
    if (!hasSessionHint()) return;
    apiFetch("/auth/me")
      .then(({ ok, data }) => {
        if (ok) setUser(data);
        else setSessionHint(false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // path: /auth/login | /auth/signup | /auth/admin/login
  async function authenticate(path, body) {
    try {
      const res = await apiPost(path, body);
      if (res.ok) {
        setSessionHint(true);
        setUser(res.data.user);
      }
      return res;
    } catch {
      return { ok: false, data: { error: "Could not reach the server. Try again." } };
    }
  }

  async function logout() {
    setSessionHint(false);
    setUser(null);
    try {
      await apiPost("/auth/logout"); // server clears the cookie
    } catch {
      /* offline: cookie expires on its own */
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, authenticate, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
