import { useState } from "react";
import axios from "axios";
import "./SignupPage.css";

export function SignupPage({ setUser }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/auth/register", formData, {
        withCredentials: true, // include cookies for session
      });

      setMessage("✅ Registration successful!");
      setFormData({ name: "", email: "", password: "" });

      // If backend auto-logs in after signup
      if (res.data.user) {
        setUser(res.data.user);
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setMessage(
        error.response?.data?.message || "❌ Registration failed. Try again."
      );
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
      </form>
    </div>
  );
}
