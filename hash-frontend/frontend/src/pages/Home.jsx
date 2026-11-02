import { Link } from "react-router-dom";
import { useApi } from "../api";

const fallbackTracks = [
  {
    name: "Build Sprint",
    category: "Software",
    copy: "A timed hackathon — pick a problem statement, ship a working build.",
  },
  {
    name: "Circuit Arena",
    category: "Robotics",
    copy: "Bring your own bot and battle it out in the arena.",
  },
  {
    name: "Model Showcase",
    category: "AI / ML",
    copy: "Present a model or pipeline to a panel of judges.",
  },
];

function Home() {
  const tracks = useApi("/home/tracks", fallbackTracks);
  return (
    <div className="page-home">
      <section className="hero">
        <div className="hero-content">
          <div className="hero-kicker">
            <span className="hash-mark">#</span>
            <span>MBCET · Innovation &amp; Entrepreneurship Development Centre</span>
          </div>
          <h1>
            HASH<span className="hero-year">2026</span>
          </h1>
          <p className="hero-copy">
            MBCET's technical fest — a weekend of hackathons, robotics, applied AI and
            design work, built and judged on campus.
          </p>
          <div className="hero-actions">
            <Link className="btn btn-primary" to="/register">
              Register
            </Link>
            <Link className="btn btn-outline" to="/events">
              See the tracks
            </Link>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <strong>{tracks.length}+</strong>
            <span>Tracks</span>
          </div>
          <div className="stat">
            <strong>MBCET</strong>
            <span>Campus venue</span>
          </div>
          <div className="stat">
            <strong>2026</strong>
            <span>Edition</span>
          </div>
        </div>
      </section>

      <section className="section tracks">
        <div className="section-head">
          <h2>Featured tracks</h2>
          <Link to="/events" className="text-link">
            View all events
          </Link>
        </div>
        <div className="track-grid">
          {tracks.map((t) => (
            <div className="track-card" key={t.name}>
              <span className="track-cat">{t.category}</span>
              <h3>{t.name}</h3>
              <p>{t.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section about">
        <div className="about-grid">
          <h2>What HASH is</h2>
          <p>
            HASH is run by MBCET's Innovation &amp; Entrepreneurship Development
            Centre, bringing hackathons, robotics, and design work onto one campus
            for a weekend. The goal is working demos over slide decks — build
            something, show it, get judged on it.
          </p>
        </div>
      </section>

      <section className="section updates">
        <h2>Updates</h2>
        <ul className="update-list">
          <li>
            <span className="update-dot" />
            Registration for all tracks is open — see the Events page for fees and seats.
          </li>
          <li>
            <span className="update-dot" />
            Track rules and judging criteria will be published here as they're finalised.
          </li>
          <li>
            <span className="update-dot" />
            Questions go to the coordinators listed on the Contact page.
          </li>
        </ul>
      </section>
    </div>
  );
}

export default Home;
