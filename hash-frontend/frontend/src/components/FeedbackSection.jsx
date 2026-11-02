import { useState } from "react";
import { apiPost, useApi } from "../api";

// SECURITY NOTE (XSS): feedback text comes from users, so it is untrusted.
// It is rendered below as {f.message} - React turns that into plain text, so
// "<script>alert('hi')</script>" is shown literally and never executed.
// Never use dangerouslySetInnerHTML with user-supplied text.
function FeedbackSection() {
  const loaded = useApi("/feedback", []);
  const [added, setAdded] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const items = [...added, ...loaded.filter((f) => !added.some((a) => a.id === f.id))];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return setError("Please write a message");
    setBusy(true);
    setError("");
    try {
      const { ok, data } = await apiPost("/feedback", { name: name.trim(), message: message.trim() });
      if (ok) {
        setAdded((a) => [data, ...a]);
        setMessage("");
      } else {
        setError(data.errors?.message || data.error || "Could not send feedback");
      }
    } catch {
      setError("Could not reach the server. Try again.");
    }
    setBusy(false);
  }

  return (
    <section className="feedback">
      <h2>Feedback</h2>
      <form className="reg-form" onSubmit={handleSubmit} noValidate>
        <label htmlFor="fb-name">Name (optional)</label>
        <input id="fb-name" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />

        <label htmlFor="fb-message">Your feedback</label>
        <textarea
          id="fb-message"
          rows={3}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {error && <p className="error-msg">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Sending..." : "Send feedback"}
        </button>
      </form>

      <ul className="feedback-list">
        {items.length === 0 && <li className="empty-msg">No feedback yet. Be the first.</li>}
        {items.map((f) => (
          <li key={f.id} className="feedback-item">
            <strong>{f.name}</strong>
            <p>{f.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default FeedbackSection;
