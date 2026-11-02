import { createApp } from "./src/app.js";
import { connectDb } from "./src/db.js";
import { assertProductionConfig } from "./src/config.js";

// Load .env if present (Node >= 20.12). On Render the variables are set in the dashboard.
try { process.loadEnvFile(); } catch { /* no .env file */ }

assertProductionConfig(); // refuses to start in production with default/missing secrets

const PORT = process.env.PORT || 5000;
const app = createApp();

connectDb()
  .then(() => app.listen(PORT, () => console.log(`HASH 2026 API listening on port ${PORT}`)))
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
