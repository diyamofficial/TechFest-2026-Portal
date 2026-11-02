import { useEffect, useState } from "react";
import { apiPost } from "../api";

function EventCard({ event }) {
  const [seatsLeft, setSeatsLeft] = useState(event.seats);

  useEffect(() => {
    setSeatsLeft(event.seats);
  }, [event.seats]);

  async function handleRegister() {
    if (seatsLeft > 0) {
      try {
        const { data } = await apiPost(`/events/${event.id}/reserve`);
        if (typeof data.seats === "number") setSeatsLeft(data.seats);
      } catch {
        // backend unreachable: leave seats unchanged
      }
    }
  }

  return (
    <div className={`event-card ${seatsLeft === 0 ? "sold-out" : ""}`}>
      <span className="event-tag">{event.category}</span>
      <h3>{event.name}</h3>
      <p className="event-desc">{event.description}</p>
      <div className="event-meta">
        <span className="event-fee">{event.fee === 0 ? "Free entry" : `₹${event.fee}`}</span>
        <span className="event-seats">{seatsLeft} seats left</span>
      </div>
      {seatsLeft === 0 ? (
        <button className="btn btn-disabled" disabled>
          Sold out
        </button>
      ) : (
        <button className="btn btn-primary btn-block" onClick={handleRegister}>
          Reserve a seat
        </button>
      )}
    </div>
  );
}

export default EventCard;
