import mongoose from "mongoose";
import { events as seedEvents } from "./seed.js";
import { hashPassword } from "./auth.js";

const eventSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    fee: { type: Number, required: true, min: 0 },
    seats: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
  },
  { versionKey: false }
);

const registrationSchema = new mongoose.Schema(
  {
    participantId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    department: { type: String, required: true },
    events: { type: [String], required: true },
    userId: { type: String, index: true },
    totalFee: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 60, default: "Anonymous" },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const counterSchema = new mongoose.Schema(
  { _id: String, seq: { type: Number, default: 0 } },
  { versionKey: false }
);

export const Event = mongoose.model("Event", eventSchema);
export const Registration = mongoose.model("Registration", registrationSchema);
export const User = mongoose.model("User", userSchema);
export const Feedback = mongoose.model("Feedback", feedbackSchema);
const Counter = mongoose.model("Counter", counterSchema);

// Fields hidden from API responses so payloads match the original shape.
export const HIDE = { _id: 0 };

export async function nextParticipantId() {
  const c = await Counter.findOneAndUpdate(
    { _id: "registration" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `HASH26-${String(c.seq).padStart(4, "0")}`;
}

export async function connectDb() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hash2026";
  await mongoose.connect(uri);
  await Event.init();
  await Registration.init();
  if ((await Event.countDocuments()) === 0) {
    await Event.insertMany(seedEvents);
    console.log("Seeded events collection");
  }
  await User.init();
  // Seed the admin account from env (ADMIN_EMAIL / ADMIN_PASSWORD) if missing.
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@hash.local").toLowerCase();
  if (!(await User.exists({ email: adminEmail }))) {
    await User.create({
      name: "Admin",
      email: adminEmail,
      passwordHash: hashPassword(process.env.ADMIN_PASSWORD || "admin123"), // production requires ADMIN_PASSWORD (see config.js)
      role: "admin",
    });
    console.log(`Seeded admin account: ${adminEmail}`);
  }
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}
