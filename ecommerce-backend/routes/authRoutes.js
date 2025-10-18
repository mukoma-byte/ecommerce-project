import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser); // /api/auth/register
router.post("/login", loginUser); // /api/auth/login
router.get("/profile", protect, getProfile); // /api/auth/profile (protected)

export default router;
