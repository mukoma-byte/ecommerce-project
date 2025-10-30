import { useState } from "react";
import axios from "axios";
import "./SignupPage.css";
import { NavLink, useNavigate } from "react-router";

export function SignupPage({ setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      // 1️⃣ Send registration request
      const res = await axios.post("/api/auth/register", formData, {
        withCredentials: true,
      });

      // 2️⃣ Optional: check /me to confirm session
      try {
        const me = await axios.get("/api/auth/me", { withCredentials: true });
        setUser(me.data.user);
      } catch (checkErr) {
        console.warn("User session not immediately available:", checkErr);
        // not critical — user might need to refresh
      }

      // 3️⃣ Show success message
      setMessage("✅ Registration successful! Welcome aboard.");
      setFormData({ name: "", email: "", password: "" });

            setTimeout(() => {
              navigate("/");
            }, 800);
    } catch (error) {
      console.error("Registration error:", error);

      // Handle known backend errors (status 400, 409, etc.)
      if (error.response) {
        if (error.response.status === 400) {
          setMessage(
            error.response.data.message ||
              "⚠️ Invalid input. Check your details."
          );
        } else if (error.response.status === 409) {
          setMessage("⚠️ Email already registered. Try logging in instead.");
        } else {
          setMessage(
            error.response.data.message || "❌ Something went wrong on our end."
          );
        }
      }
      // Handle network or unknown errors
      else if (error.request) {
        setMessage("🌐 Network error — please check your connection.");
      } else {
        setMessage("❌ Unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <form className="signup-form" onSubmit={handleSubmit}>
        <h2>Create an Account</h2>

        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Your full name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter a strong password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Sign Up"}
        </button>

        {message && <p className="signup-message">{message}</p>}
        <p className="auth-switch">
          Don’t have an account?{" "}
          <NavLink to="/login" className="auth-link">
            Log in
          </NavLink>
        </p>
      </form>
    </div>
  );
}
