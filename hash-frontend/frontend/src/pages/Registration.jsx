import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import staticEvents from "../data/events";
import { apiPost, useApi } from "../api";

const fallbackDepartments = [
  "Computer Science and Engineering",
  "Electronics and Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
];

function Registration() {
  const events = useApi("/events", staticEvents);
  const departments = useApi("/departments", fallbackDepartments);
  const { user, loading } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState(fallbackDepartments[0]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setName((n) => n || user.name);
      setEmail((m) => m || user.email);
    }
  }, [user]);

  function toggleEvent(eventName) {
    setSelectedEvents((prev) =>
      prev.includes(eventName)
        ? prev.filter((e) => e !== eventName)
        : [...prev, eventName]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (name.trim() === "") {
      newErrors.name = "Name is required";
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit Indian mobile number";
    }
    if (selectedEvents.length === 0) {
      newErrors.events = "Pick at least one track";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const { ok, data } = await apiPost("/registrations", {
          name: name.trim(),
          email: email.trim(),
          phone,
          department,
          events: selectedEvents,
        });
        if (ok) {
          setSubmitted(true);
        } else {
          setErrors(data.errors || { form: data.error || "Registration failed" });
        }
      } catch {
        setErrors({ form: "Could not reach the server. Try again." });
      }
    }
  }

  if (loading) return null;

  if (!user) {
    return (
      <div className="page">
        <h1>Register</h1>
        <p className="page-lead">Sign in or create an account to register for tracks.</p>
        <Link to="/login" state={{ from: "/register" }} className="btn btn-primary">
          Login / Sign up
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="success-card">
          <span className="hash-mark">#</span>
          <h1>You're in, {name.split(" ")[0]}</h1>
          <p>
            Registered for {selectedEvents.join(", ")}. A confirmation and
            participant ID will be sent to {email}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>Register</h1>
      <p className="page-lead">One form, every track — pick as many as you want.</p>
      <form className="reg-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="name">Full name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
        {errors.name && <p className="error-msg">{errors.name}</p>}

        <label htmlFor="email">Email</label>
        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <p className="error-msg">{errors.email}</p>}

        <label htmlFor="phone">Mobile number</label>
        <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        {errors.phone && <p className="error-msg">{errors.phone}</p>}

        <label htmlFor="department">Department</label>
        <select id="department" value={department} onChange={(e) => setDepartment(e.target.value)}>
          {departments.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <label>Choose tracks</label>
        <div className="checkbox-group">
          {events.map((event) => (
            <label key={event.id} className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedEvents.includes(event.name)}
                onChange={() => toggleEvent(event.name)}
              />
              {event.name}
            </label>
          ))}
        </div>
        {errors.events && <p className="error-msg">{errors.events}</p>}

        {errors.form && <p className="error-msg">{errors.form}</p>}

        <button className="btn btn-primary" type="submit">
          Submit registration
        </button>
      </form>
    </div>
  );
}

export default Registration;
