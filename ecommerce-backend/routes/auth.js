// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js"; // Sequelize model

const router = express.Router();

// REGISTER new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    

    // Option 1: Auto-login after registration (recommended)
    req.session.user = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
    };

    console.log(req.session);

    // Option 2: Comment out above if you prefer manual login

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser.id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed. Try again." });
  }
});

export default router;
