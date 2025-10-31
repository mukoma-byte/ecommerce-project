import { sequelize } from "./index.js";

try {
  await sequelize.authenticate();
  await sequelize.sync();
  console.log("✅ SQLite OK!");
} catch (err) {
  console.error("❌ Database error:", err);
} finally {
  process.exit();
}
