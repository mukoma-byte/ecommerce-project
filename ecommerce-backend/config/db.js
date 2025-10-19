import sqlite3 from "sqlite3";
import { open } from "sqlite";

// Open a single shared database connection
export const db = await open({
  filename: "./ecommerce.db",
  driver: sqlite3.Database,
});

// Create tables if they don't exist
await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    order_id INTEGER,
    amount REAL,
    status TEXT,
    checkout_request_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
