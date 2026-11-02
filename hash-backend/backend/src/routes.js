import { Router } from "express";
import { Event, Registration, User, Feedback, HIDE, nextParticipantId } from "./db.js";
import { hashPassword, verifyPassword, setAuthCookie, clearAuthCookie, requireAuth, requireAdmin } from "./auth.js";
import * as seed from "./seed.js";

const router = Router();

// Express 4 does not catch rejected promises; forward them to the error handler.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ---------- health ----------
router.get("/health", (_req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ---------- auth ----------
const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role });

// POST /api/auth/signup   { name, email, password }
router.post(
  "/auth/signup",
  wrap(async (req, res) => {
    const { name: n, email: e, password: p } = req.body || {};
    // Only plain strings are accepted (objects like {"$ne":null} are rejected).
    if ([n, e, p].some((v) => typeof v !== "string")) return res.status(400).json({ error: "Invalid input" });
    const name = n.trim();
    const email = e.trim().toLowerCase();
    const password = p;
    const errors = {};
    if (!name) errors.name = "Name is required";
    else if (name.length > 100) errors.name = "Name is too long";
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) errors.email = "Enter a valid email";
    if (password.length < 8) errors.password = "Password must be at least 8 characters";
    else if (password.length > 128) errors.password = "Password is too long";
    if (Object.keys(errors).length) return res.status(400).json({ error: "Validation failed", errors });
    if (await User.exists({ email }))
      return res.status(409).json({ error: "Account exists", errors: { email: "Email already registered. Sign in instead." } });
    const user = await User.create({ name, email, passwordHash: hashPassword(password), role: "user" });
    setAuthCookie(res, user); // httpOnly cookie - the token is never exposed to page scripts
    res.status(201).json({ user: publicUser(user) });
  })
);

async function login(req, res, role) {
  const { email: e, password } = req.body || {};
  if (typeof e !== "string" || typeof password !== "string")
    return res.status(400).json({ error: "Email and password are required" });
  const email = e.trim().toLowerCase();
  const user = await User.findOne({ email, role });
  if (!user || !verifyPassword(password, user.passwordHash))
    return res.status(401).json({ error: "Invalid email or password" });
  setAuthCookie(res, user);
  res.json({ user: publicUser(user) });
}

router.post("/auth/login", wrap((req, res) => login(req, res, "user")));
router.post("/auth/admin/login", wrap((req, res) => login(req, res, "admin")));

router.post("/auth/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get(
  "/auth/me",
  requireAuth,
  wrap(async (req, res) => {
    const user = await User.findById(req.auth.sub);
    if (!user) return res.status(401).json({ error: "Login required" });
    res.json(publicUser(user));
  })
);

// Logged-in user's own registrations.
router.get(
  "/my/registrations",
  requireAuth,
  wrap(async (req, res) => {
    res.json(await Registration.find({ userId: req.auth.sub }, HIDE).sort({ createdAt: -1 }).lean());
  })
);

// ---------- events ----------
// GET /api/events?search=&category=   (both optional, same semantics as the Events page filters)
router.get(
  "/events",
  wrap(async (req, res) => {
    const search = String(req.query.search || "").slice(0, 50);
    const category = String(req.query.category || "All");
    const filter = {};
    if (search) filter.name = new RegExp(escapeRegex(search), "i");
    if (category !== "All") filter.category = category;
    res.json(await Event.find(filter, HIDE).sort({ id: 1 }).lean());
  })
);

router.get("/events/categories", (_req, res) => res.json(["All", ...seed.categories]));

router.get(
  "/events/:id",
  wrap(async (req, res) => {
    const event = await Event.findOne({ id: Number(req.params.id) }, HIDE).lean();
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  })
);

// "Reserve a seat" button on an event card: takes one seat (atomic).
router.post(
  "/events/:id/reserve",
  wrap(async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid event id" });
    const event = await Event.findOneAndUpdate(
      { id, seats: { $gt: 0 } },
      { $inc: { seats: -1 } },
      { new: true }
    ).lean();
    if (event) return res.json({ id: event.id, name: event.name, seats: event.seats });
    const exists = await Event.exists({ id });
    if (!exists) return res.status(404).json({ error: "Event not found" });
    res.status(409).json({ error: "Sold out", seats: 0 });
  })
);

// ---------- registration ----------
router.get("/departments", (_req, res) => res.json(seed.departments));

async function validateRegistration(body = {}) {
  const errors = {};
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const department = body.department;
  const eventNames = Array.isArray(body.events)
    ? [...new Set(body.events.filter((n) => typeof n === "string"))].slice(0, 20)
    : [];

  if (name === "") errors.name = "Name is required";
  else if (name.length > 100) errors.name = "Name is too long";
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) errors.email = "Enter a valid email";
  if (!/^[6-9]\d{9}$/.test(phone)) errors.phone = "Enter a valid 10-digit Indian mobile number";
  if (!seed.departments.includes(department)) errors.department = "Choose a valid department";

  let chosen = [];
  if (eventNames.length === 0) errors.events = "Pick at least one track";
  else {
    chosen = await Event.find({ name: { $in: eventNames } }, HIDE).lean();
    if (chosen.length !== eventNames.length) errors.events = "One or more tracks do not exist";
  }
  return { errors, values: { name, email, phone, department, eventNames }, chosen };
}

// POST /api/registrations   { name, email, phone, department, events: [eventName, ...] }
router.post(
  "/registrations",
  requireAuth,
  wrap(async (req, res) => {
    const { errors, values, chosen } = await validateRegistration(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ error: "Validation failed", errors });

    const dup = await Registration.find({
      email: new RegExp(`^${escapeRegex(values.email)}$`, "i"),
      events: { $in: values.eventNames },
    }).lean();
    if (dup.length) {
      const taken = values.eventNames.filter((n) => dup.some((r) => r.events.includes(n)));
      return res.status(409).json({
        error: "Already registered",
        errors: { events: `Already registered for: ${taken.join(", ")}` },
      });
    }

    // Take one seat per track atomically; roll back if any track is sold out.
    const taken = [];
    let soldOut = null;
    for (const e of chosen) {
      const ok = await Event.findOneAndUpdate({ id: e.id, seats: { $gt: 0 } }, { $inc: { seats: -1 } });
      if (!ok) {
        soldOut = e.name;
        break;
      }
      taken.push(e.id);
    }
    if (soldOut) {
      if (taken.length) await Event.updateMany({ id: { $in: taken } }, { $inc: { seats: 1 } });
      return res.status(409).json({ error: "Sold out", errors: { events: `Sold out: ${soldOut}` } });
    }

    try {
      const registration = await Registration.create({
        participantId: await nextParticipantId(),
        name: values.name,
        email: values.email,
        phone: values.phone,
        department: values.department,
        events: chosen.map((e) => e.name),
        userId: req.auth.sub,
        totalFee: chosen.reduce((sum, e) => sum + e.fee, 0),
      });
      const { _id, ...out } = registration.toObject();
      res.status(201).json(out);
    } catch (err) {
      await Event.updateMany({ id: { $in: taken } }, { $inc: { seats: 1 } });
      throw err;
    }
  })
);

// Admin: list registrations. Requires an admin session (or the optional x-admin-key).
router.get(
  "/registrations",
  requireAdmin,
  wrap(async (req, res) => {
    res.json(await Registration.find({}, HIDE).sort({ createdAt: 1 }).lean());
  })
);

// Admin dashboard data (admin token required).
router.get(
  "/admin/summary",
  requireAdmin,
  wrap(async (_req, res) => {
    const [users, registrations, events] = await Promise.all([
      User.find({ role: "user" }, { passwordHash: 0 }).sort({ createdAt: -1 }).lean(),
      Registration.find({}, HIDE).sort({ createdAt: -1 }).lean(),
      Event.find({}, HIDE).sort({ id: 1 }).lean(),
    ]);
    res.json({
      stats: {
        users: users.length,
        registrations: registrations.length,
        revenue: registrations.reduce((s, r) => s + r.totalFee, 0),
      },
      users: users.map((u) => ({ id: String(u._id), name: u.name, email: u.email, createdAt: u.createdAt })),
      registrations,
      events,
    });
  })
);

// ---------- feedback ----------
// Text is stored exactly as typed and returned as JSON. The React frontend renders
// it as plain text (never as HTML), so <script> tags typed here stay harmless.
router.get(
  "/feedback",
  wrap(async (_req, res) => {
    const rows = await Feedback.find({}).sort({ createdAt: -1 }).limit(20).lean();
    res.json(rows.map((f) => ({ id: String(f._id), name: f.name, message: f.message, createdAt: f.createdAt })));
  })
);

router.post(
  "/feedback",
  wrap(async (req, res) => {
    const { name: n, message: m } = req.body || {};
    if (typeof m !== "string" || (n !== undefined && typeof n !== "string"))
      return res.status(400).json({ error: "Validation failed", errors: { message: "Invalid input" } });
    const name = (n || "").trim().slice(0, 60) || "Anonymous";
    const message = m.trim();
    if (!message) return res.status(400).json({ error: "Validation failed", errors: { message: "Please write a message" } });
    if (message.length > 500)
      return res.status(400).json({ error: "Validation failed", errors: { message: "Keep it under 500 characters" } });
    const f = await Feedback.create({ name, message });
    res.status(201).json({ id: String(f._id), name: f.name, message: f.message, createdAt: f.createdAt });
  })
);

// ---------- static page content ----------
router.get("/home/tracks", (_req, res) => res.json(seed.featuredTracks));
router.get("/home/updates", (_req, res) => res.json(seed.updates));
router.get("/schedule", (_req, res) => res.json(seed.schedule));
router.get("/gallery", (_req, res) => res.json(seed.gallery));
router.get("/contact", (_req, res) => res.json(seed.contact));
router.get("/contact/coordinators", (_req, res) => res.json(seed.contact.coordinators));

export default router;
