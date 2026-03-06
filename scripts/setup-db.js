/* eslint-disable @typescript-eslint/no-require-imports */
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });

async function setupDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const schema = fs.readFileSync(
    path.resolve(__dirname, "../src/lib/schema.sql"),
    "utf-8",
  );

  try {
    console.log("🔧 Setting up database...");
    await pool.query(schema);
    console.log("✅ Database schema created successfully!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

setupDatabase();
