import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const links = [
    { to: "/", label: "Home", end: true },
    { to: "/events", label: "Events" },
    { to: "/register", label: "Register" },
    { to: "/gallery", label: "Gallery" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="navbar">
      <div className="brand">
        <img src="/images/logo-mark.png" alt="HASH logo" className="brand-logo" width="32" height="32" />
        <span className="brand-name">HASH<span className="brand-year">2026</span></span>
      </div>

      <button
        className="nav-toggle"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      <div className={`nav-links ${open ? "is-open" : ""}`}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            {l.label}
          </NavLink>
        ))}
        {user ? (
          <>
            {user.role === "admin" && (
              <NavLink to="/admin" onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
                Dashboard
              </NavLink>
            )}
            <span className="nav-user">{user.name.split(" ")[0]}</span>
            <button className="theme-btn" onClick={() => { logout(); setOpen(false); }}>
              Logout
            </button>
          </>
        ) : (
          <NavLink to="/login" onClick={() => setOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
            Login
          </NavLink>
        )}
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === "light" ? "Dark" : "Light"}
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
