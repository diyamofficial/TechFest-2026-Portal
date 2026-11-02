import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/register";

  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={user.role === "admin" ? "/admin" : redirectTo} replace />;

  function switchMode(m) {
    setMode(m);
    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (mode === "signup" && name.trim() === "") newErrors.name = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Enter a valid email";
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters";
    setErrors(newErrors);
    if (Object.keys(newErrors).length) return;

    setBusy(true);
    const body = mode === "signup" ? { name: name.trim(), email: email.trim(), password } : { email: email.trim(), password };
    const { ok, data } = await authenticate(mode === "signup" ? "/auth/signup" : "/auth/login", body);
    setBusy(false);
    if (ok) navigate(redirectTo, { replace: true });
    else setErrors(data.errors || { form: data.error || "Something went wrong" });
  }

  return (
    <div className="page">
      <h1>{mode === "signup" ? "Create account" : "Sign in"}</h1>
      <p className="page-lead">
        {mode === "signup"
          ? "Sign up once, then register for any track."
          : "Sign in to register for tracks."}
      </p>

      <div className="auth-tabs">
        <button type="button" className={mode === "signin" ? "active" : ""} onClick={() => switchMode("signin")}>
          Sign in
        </button>
        <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")}>
          Sign up
        </button>
      </div>

      <form className="reg-form" onSubmit={handleSubmit} noValidate>
        {mode === "signup" && (
          <>
            <label htmlFor="name">Full name</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            {errors.name && <p className="error-msg">{errors.name}</p>}
          </>
        )}

        <label htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p className="error-msg">{errors.email}</p>}

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
        {errors.password && <p className="error-msg">{errors.password}</p>}

        {errors.form && <p className="error-msg">{errors.form}</p>}

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <p className="auth-alt">
        Organiser? <Link to="/admin/login" className="text-link">Admin login</Link>
      </p>
    </div>
  );
}

export default Login;
