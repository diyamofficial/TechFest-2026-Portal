// Seed content mirrored from the frontend. Runtime state (seats left,
// registrations) lives in data/db.json, created on first run.

export const departments = [
  "Computer Science and Engineering",
  "Electronics and Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Electrical Engineering",
];

export const categories = [
  "Software & Computing",
  "Robotics",
  "Artificial Intelligence",
  "Design & Innovation",
];

export const events = [
  { id: 1, name: "Build Sprint", category: "Software & Computing", fee: 500, seats: 60,
    description: "A timed hackathon track — pick a problem statement and ship a working build by the deadline." },
  { id: 2, name: "Circuit Arena", category: "Robotics", fee: 700, seats: 24,
    description: "Bring a bot, face off in the arena. Rules and weight classes posted closer to the date." },
  { id: 3, name: "Model Showcase", category: "Artificial Intelligence", fee: 400, seats: 50,
    description: "Present a model, pipeline, or dataset study to a panel — applied work over slideware." },
  { id: 4, name: "Stack Relay", category: "Software & Computing", fee: 300, seats: 45,
    description: "Design and ship a small end-to-end web app within the event window, judged on architecture and UX." },
  { id: 5, name: "Interface Lab", category: "Design & Innovation", fee: 250, seats: 40,
    description: "Prototype a product experience from a brief given on the day. Any tool, your call." },
  { id: 6, name: "Motion Brief", category: "Design & Innovation", fee: 0, seats: 30,
    description: "Submit an original motion or vector piece on the fest theme. Open to all departments, free entry." },
];

export const featuredTracks = [
  { name: "Build Sprint", category: "Software", copy: "A timed hackathon — pick a problem statement, ship a working build." },
  { name: "Circuit Arena", category: "Robotics", copy: "Bring your own bot and battle it out in the arena." },
  { name: "Model Showcase", category: "AI / ML", copy: "Present a model or pipeline to a panel of judges." },
];

export const updates = [
  "Registration for all tracks is open — see the Events page for fees and seats.",
  "Track rules and judging criteria will be published here as they're finalised.",
  "Questions go to the coordinators listed on the Contact page.",
];

export const schedule = {
  columns: ["Slot", "Day 1", "Day 2"],
  rows: [
    ["Morning", "Opening & track kickoff", "Midpoint evaluations"],
    ["Afternoon", "Build / working sessions", "Presentations & demos"],
    ["Evening", "Mentor check-ins", "Finals & closing"],
  ],
  note: "Exact timings and dates will be posted here closer to the event.",
};

export const gallery = [
  { src: "/images/event1.jpg", caption: "Opening session" },
  { src: "/images/coding.jpg", caption: "Build Sprint, in progress" },
  { src: "/images/robotics.jpg", caption: "Circuit Arena" },
  { src: "/images/event_audience.jpg", caption: "Talks & workshops" },
];

export const contact = {
  coordinators: [
    { name: "Diya", role: "Executive Officer, IEDC MBCET",
      blurb: "Core event planning and web operations for HASH.", email: "hash@mbcet.edu" },
  ],
  venue: { name: "MBCET Campus", location: "Thiruvananthapuram, Kerala", dates: "Dates to be announced" },
  organiser: { name: "Innovation & Entrepreneurship Development Centre", institute: "MBCET", email: "hash@mbcet.edu" },
  sponsorEmail: "hash@mbcet.edu",
};
