import { useApi } from "../api";
import FeedbackSection from "../components/FeedbackSection";

// Placeholder coordinator + sponsor content — add the rest of the team
// and confirmed sponsors before launch.
const fallbackCoordinators = [
  {
    name: "Diya",
    role: "Executive Officer, IEDC MBCET",
    blurb: "Core event planning and web operations for HASH.",
    email: "hash@mbcet.edu",
  },
];

function Contact() {
  const coordinators = useApi("/contact/coordinators", fallbackCoordinators);
  return (
    <div className="page">
      <h1>Contact</h1>
      <p className="page-lead">Questions about a track, or want to sponsor HASH? Reach out.</p>

      <section>
        <h2>Coordinators</h2>
        <div className="coord-grid">
          {coordinators.map((c) => (
            <div key={c.email} className="coord-card">
              <h3>{c.name}</h3>
              <p className="coord-role">{c.role}</p>
              <p className="coord-blurb">{c.blurb}</p>
              <a href={`mailto:${c.email}`}>{c.email}</a>
            </div>
          ))}
          <div className="coord-card coord-card-add">
            <p>Add the rest of the organising team here.</p>
          </div>
        </div>
      </section>

      <section className="contact-details">
        <div className="contact-card">
          <h2>Venue</h2>
          <p>MBCET Campus</p>
          <p>Thiruvananthapuram, Kerala</p>
          <p>Dates to be announced</p>
        </div>
        <div className="contact-card">
          <h2>Run by</h2>
          <p>Innovation &amp; Entrepreneurship Development Centre</p>
          <p>MBCET</p>
          <a href="mailto:hash@mbcet.edu">hash@mbcet.edu</a>
        </div>
      </section>

      <FeedbackSection />

      <section className="sponsor-cta">
        <h2>Sponsor HASH 2026</h2>
        <p>
          Interested in partnering with us? Get in touch and we'll share the
          sponsorship deck once it's ready.
        </p>
        <a className="btn btn-outline" href="mailto:hash@mbcet.edu">
          Email the team
        </a>
      </section>
    </div>
  );
}

export default Contact;
