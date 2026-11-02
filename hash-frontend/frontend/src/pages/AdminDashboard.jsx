import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api";

const fmtDate = (d) => new Date(d).toLocaleString();

function AdminDashboard() {
  const { user, loading } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") return;
    apiFetch("/admin/summary")
      .then((res) => (res.ok ? setData(res.data) : setError(res.data.error || "Failed to load")))
      .catch(() => setError("Could not reach the server."));
  }, [user]);

  if (loading) return null;
  if (user?.role !== "admin") return <Navigate to="/admin/login" replace />;

  return (
    <div className="page">
      <h1>Admin dashboard</h1>
      <p className="page-lead">Users, registrations and seat status.</p>
      {error && <p className="error-msg">{error}</p>}
      {!data && !error && <p className="empty-msg">Loading...</p>}

      {data && (
        <>
          <div className="admin-stats">
            <div className="admin-stat"><strong>{data.stats.users}</strong><span>Users</span></div>
            <div className="admin-stat"><strong>{data.stats.registrations}</strong><span>Registrations</span></div>
            <div className="admin-stat"><strong>₹{data.stats.revenue}</strong><span>Total fees</span></div>
          </div>

          <section className="schedule">
            <h2>Registrations</h2>
            {data.registrations.length === 0 ? (
              <p className="empty-msg">No registrations yet.</p>
            ) : (
              <div className="table-wrap admin-table">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Department</th><th>Tracks</th><th>Fee</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.registrations.map((r) => (
                      <tr key={r.participantId}>
                        <td>{r.participantId}</td>
                        <td>{r.name}</td>
                        <td>{r.email}</td>
                        <td>{r.phone}</td>
                        <td>{r.department}</td>
                        <td>{r.events.join(", ")}</td>
                        <td>₹{r.totalFee}</td>
                        <td>{fmtDate(r.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="schedule">
            <h2>Users</h2>
            {data.users.length === 0 ? (
              <p className="empty-msg">No users yet.</p>
            ) : (
              <div className="table-wrap admin-table">
                <table className="schedule-table">
                  <thead>
                    <tr><th>Name</th><th>Email</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {data.users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td>{u.email}</td>
                        <td>{fmtDate(u.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="schedule">
            <h2>Seats left</h2>
            <div className="table-wrap admin-table">
              <table className="schedule-table">
                <thead>
                  <tr><th>Track</th><th>Category</th><th>Fee</th><th>Seats left</th></tr>
                </thead>
                <tbody>
                  {data.events.map((e) => (
                    <tr key={e.id}>
                      <td>{e.name}</td>
                      <td>{e.category}</td>
                      <td>₹{e.fee}</td>
                      <td>{e.seats}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
