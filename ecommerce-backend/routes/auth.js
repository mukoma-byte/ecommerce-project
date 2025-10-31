// routes/auth.js
import express from "express";
import bcrypt from "bcrypt";
import { User } from "../models/User.js";
import { CartItem } from "../models/CartItem.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 3️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 5️⃣ Create session (auto-login)
    req.session.user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    };

    console.log("User registered:", req.session.user);

    // 6️⃣ Merge guest cart into user cart
    const guestCartItems = await CartItem.findAll({
      where: { sessionId: req.session.id },
    });

    for (const item of guestCartItems) {
      const existingItem = await CartItem.findOne({
        where: { userId: newUser.id, productId: item.productId },
      });

      if (existingItem) {
        existingItem.quantity += item.quantity;
        await existingItem.save();
        await item.destroy();
      } else {
        item.userId = newUser.id;
        item.sessionId = null;
        await item.save();
      }
    }

    await req.session.save();

    // 7️⃣ Respond with user info
    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred during registration",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2️⃣ Find the user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3️⃣ Compare entered password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4️⃣ Create a session for the user
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    console.log("User logged in:", req.session.user);

    // merge session cart into user cart
    const guestCartItems = await CartItem.findAll({
      where: { sessionId: req.session.id },
    });

    for (const item of guestCartItems) {
      const existingItem = await CartItem.findOne({
        where: { userId: user.id, productId: item.productId },
      });

      if (existingItem) {
        existingItem.quantity += item.quantity;
        await existingItem.save();
        await item.destroy();
      } else {
        item.userId = user.id;
        item.sessionId = null;
        await item.save();
      }
    }

    await req.session.save();

    // 5️⃣ Send success response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: req.session.user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred during login",
    });
  }
});

router.get("/me", async (req, res) => {
  try {
    // Check if session exists
    if (!req.session.user) {
      return res.status(200).json({
        success: true,
        user: null,
        message: "No active session",
      });
    }

    //  Fetch fresh user data from DB
    const user = await User.findByPk(req.session.user.id, {
      attributes: ["id", "name", "email"],
    });

    //  Handle case where session exists but user was deleted
    if (!user) {
      console.warn(
        `Session exists but user not found (ID: ${req.session.user.id})`
      );
      // destroy invalid session
      req.session.destroy(() => {});
      return res.status(200).json({
        success: true,
        user: null,
        message: "User not found. Session cleared.",
      });
    }

    //  Return valid user
    res.status(200).json({
      success: true,
      user,
      message: "Session active",
    });
  } catch (error) {
    console.error("Error checking user session:", error);

    //  Handle specific known errors (optional granularity)
    if (error.name === "SequelizeConnectionError") {
      return res.status(503).json({
        success: false,
        message: "Database temporarily unavailable",
      });
    }

    //  Fallback for unexpected errors
    res.status(500).json({
      success: false,
      message: "Failed to check user session",
    });
  }
});

// routes/auth.js

router.post("/logout", (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(200).json({
        success: true,
        message: "No active session to log out from",
      });
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to log out. Please try again.",
        });
      }

      // Clear cookie manually if needed (depending on your setup)
      res.clearCookie("connect.sid", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    });
  } catch (error) {
    console.error("Unexpected logout error:", error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred during logout",
    });
  }
});

export default router;
