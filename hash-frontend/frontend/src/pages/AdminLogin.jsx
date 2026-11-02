import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function AdminLogin() {
  const { user, authenticate, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Enter email and password");
    setBusy(true);
    if (user) logout();
    const { ok, data } = await authenticate("/auth/admin/login", { email: email.trim(), password });
    setBusy(false);
    if (ok) navigate("/admin", { replace: true });
    else setError(data.error || "Login failed");
  }

  return (
    <div className="page">
      <h1>Admin login</h1>
      <p className="page-lead">Organisers only.</p>
      <form className="reg-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="admin-email">Admin email</label>
        <input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label htmlFor="admin-password">Password</label>
        <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        {error && <p className="error-msg">{error}</p>}

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Please wait..." : "Sign in as admin"}
        </button>
      </form>
      <p className="auth-alt">
        Participant? <Link to="/login" className="text-link">User login</Link>
      </p>
    </div>
  );
}

export default AdminLogin;
