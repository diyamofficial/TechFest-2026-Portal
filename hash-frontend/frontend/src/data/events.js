// Placeholder event data — swap in HASH 2026's real tracks, fees and seat
// counts before launch. Shape stays the same everywhere it's used:
// { id, name, category, fee, seats, description }

const events = [
  {
    id: 1,
    name: "Build Sprint",
    category: "Software & Computing",
    fee: 500,
    seats: 60,
    description: "A timed hackathon track — pick a problem statement and ship a working build by the deadline.",
  },
  {
    id: 2,
    name: "Circuit Arena",
    category: "Robotics",
    fee: 700,
    seats: 24,
    description: "Bring a bot, face off in the arena. Rules and weight classes posted closer to the date.",
  },
  {
    id: 3,
    name: "Model Showcase",
    category: "Artificial Intelligence",
    fee: 400,
    seats: 50,
    description: "Present a model, pipeline, or dataset study to a panel — applied work over slideware.",
  },
  {
    id: 4,
    name: "Stack Relay",
    category: "Software & Computing",
    fee: 300,
    seats: 45,
    description: "Design and ship a small end-to-end web app within the event window, judged on architecture and UX.",
  },
  {
    id: 5,
    name: "Interface Lab",
    category: "Design & Innovation",
    fee: 250,
    seats: 40,
    description: "Prototype a product experience from a brief given on the day. Any tool, your call.",
  },
  {
    id: 6,
    name: "Motion Brief",
    category: "Design & Innovation",
    fee: 0,
    seats: 30,
    description: "Submit an original motion or vector piece on the fest theme. Open to all departments, free entry.",
  },
];

export default events;
