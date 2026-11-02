// Stand-alone demo of a NoSQL-injection login bypass (BEFORE / AFTER).
// It uses its own collection (demo_users) and port, so your real data is untouched.
//
//   BEFORE (vulnerable):  node security-demo/nosql-injection-demo.js
//   AFTER  (protected):   SANITIZE=on node security-demo/nosql-injection-demo.js
//        (Windows PowerShell:  $env:SANITIZE="on"; node security-demo/nosql-injection-demo.js)
//
// See security-demo/README.md for the curl commands.
import express from "express";
import mongoose from "mongoose";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";

try { process.loadEnvFile(); } catch { /* no .env */ }

const protectedMode = process.env.SANITIZE === "on";
const app = express();
app.use(express.json());
if (protectedMode) {
  app.use(helmet());
  app.use(mongoSanitize()); // removes keys starting with "$" from req.body / query / params
}

const DemoUser = mongoose.model(
  "DemoUser",
  new mongoose.Schema({ email: String, password: String }, { collection: "demo_users" })
);

// INTENTIONALLY INSECURE: req.body goes straight into the query, and the password is compared in the query.
app.post("/login", async (req, res) => {
  const user = await DemoUser.findOne({ email: req.body.email, password: req.body.password });
  if (!user) return res.status(401).json({ result: "login failed" });
  res.json({ result: "LOGGED IN", as: user.email });
});

await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hash2026");
await DemoUser.deleteMany({});
await DemoUser.create({ email: "victim@demo.com", password: "S3cret-Not-Known-To-Attacker" });

app.listen(5050, () =>
  console.log(`Demo login on http://localhost:5050/login  (mode: ${protectedMode ? "PROTECTED - helmet + mongoSanitize" : "VULNERABLE"})`)
);
