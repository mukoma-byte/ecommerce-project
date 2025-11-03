// src/pages/LoginPage.jsx
import { useState } from "react";
import axios from "axios";
import "./LoginPage.css"; // shared styles with SignupPage
import { NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export function LoginPage({ loadCart }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // 1️⃣ Login request
      await axios.post("/api/auth/login", formData, {
        withCredentials: true,
      });

      // 2️⃣ Get current user from session
      const me = await axios.get("/api/auth/me", { withCredentials: true });
      setUser(me.data.user);

      // 3️⃣ Show success message
      setMessage("✅ Login successful! Redirecting...");
      setFormData({ email: "", password: "" });
      loadCart();

      setTimeout(() => {
        navigate("/");
      }, 800);
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        if (error.response.status === 401) {
          setMessage("⚠️ Incorrect email or password.");
        } else {
          setMessage(error.response.data.message || "❌ Something went wrong.");
        }
      } else if (error.request) {
        setMessage("🌐 Network error. Please try again.");
      } else {
        setMessage("Unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && (
          <p
            className={`auth-message ${
              message.startsWith("✅") ? "success" : "error"
            }`}
          >
            {message}
          </p>
        )}
      </form>

      <p className="auth-switch">
        Don’t have an account?{" "}
        <NavLink to="/register" className="auth-link">
          Sign up
        </NavLink>
      </p>
    </div>
  );
}
