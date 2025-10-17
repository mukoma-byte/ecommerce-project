// controllers/authController.js
import jwt from "jsonwebtoken";
import generateToken from "../utils/generateToken.js";
import { User } from "../models/User.js";

// REGISTER
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await User.findByEmail(email);
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({ name, email, password });

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      message: "User registered successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await User.verifyPassword(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user.id);
    res.json({ id: user.id, name: user.name, email: user.email, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
