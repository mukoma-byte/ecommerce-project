// models/User.js
import { db } from "../config/db.js";
import bcrypt from "bcrypt";

export class User {
  // create a new user
  static async create({ name, email, password }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );
    return { id: result.lastID, name, email };
  }

  // find a user by email
  static async findByEmail(email) {
    return await db.get("SELECT * FROM users WHERE email = ?", [email]);
  }

  // find a user by id
  static async findById(id) {
    return await db.get("SELECT id, name, email FROM users WHERE id = ?", [id]);
  }

  // verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
