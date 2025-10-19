// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Register
  const register = async (name, email, password) => {
    const res = await axios.post("/api/auth/register", {
      name,
      email,
      password,
    });
      const { token, ...user } = res.data;

      if (token) localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
  };

  // Login
  const login = async (email, password) => {
    const res = await axios.post("/api/auth/login", { email, password });

    const { token, ...user } = res.data;
     localStorage.setItem("token", token);
     localStorage.setItem("user", JSON.stringify(user));

     setUser(user);
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
