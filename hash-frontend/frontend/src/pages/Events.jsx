import { useState } from "react";
import EventList from "../components/EventList";
import staticEvents from "../data/events";
import { useApi } from "../api";

const categories = [
  "All",
  "Software & Computing",
  "Robotics",
  "Artificial Intelligence",
  "Design & Innovation",
];

function Events() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const events = useApi("/events", staticEvents);

  const filteredEvents = events.filter((event) => {
    const nameMatches = event.name.toLowerCase().includes(search.toLowerCase());
    const categoryMatches = category === "All" || event.category === category;
    return nameMatches && categoryMatches;
  });

  return (
    <div className="page">
      <h1>Events &amp; tracks</h1>
      <p className="page-lead">Pick a track, check the flow, then register below.</p>

      <section className="how-to">
        <h2>How to take part</h2>
        <ol className="steps-list">
          <li>Choose a track from the list below.</li>
          <li>Go to Registration and fill in your details.</li>
          <li>You'll get a confirmation and participant ID by email.</li>
        </ol>
      </section>

      <section className="schedule">
        <h2>Day flow</h2>
        <div className="table-wrap">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Slot</th>
                <th>Day 1</th>
                <th>Day 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Morning</td>
                <td>Opening &amp; track kickoff</td>
                <td>Midpoint evaluations</td>
              </tr>
              <tr>
                <td>Afternoon</td>
                <td>Build / working sessions</td>
                <td>Presentations &amp; demos</td>
              </tr>
              <tr>
                <td>Evening</td>
                <td>Mentor check-ins</td>
                <td>Finals &amp; closing</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="table-note">Exact timings and dates will be posted here closer to the event.</p>
      </section>

      <section>
        <h2>Browse events</h2>
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All categories" : c}
              </option>
            ))}
          </select>
        </div>
        <EventList events={filteredEvents} />
      </section>
    </div>
  );
}

export default Events;
