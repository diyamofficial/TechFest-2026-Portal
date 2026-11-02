import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import BgVideo from "./components/BgVideo";
import Home from "./pages/Home";
import { useTheme } from "./context/ThemeContext";
const Events = lazy(() => import("./pages/Events"));
const Registration = lazy(() => import("./pages/Registration"));
const Gallery = lazy(() => import("./pages/Gallery"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  const { theme } = useTheme();

  return (
    <div className={theme}>
      <BgVideo />
      <div className="app-shell">
        <Navbar />
        <Suspense fallback={<p className="empty-msg page">Loading...</p>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
        <footer className="footer">
          <div className="footer-inner">
            <img src="/images/logo-mark.png" alt="" className="footer-mark-img" width="22" height="22" loading="lazy" />
            <p>HASH 2026 — Innovation &amp; Entrepreneurship Development Centre, MBCET</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
