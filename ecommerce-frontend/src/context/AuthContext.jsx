import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
const AuthContext = createContext();

//  Custom hook to use auth easily
export const useAuth = () => useContext(AuthContext);

//  Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  //  Check session on mount
  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/auth/me", { withCredentials: true });
      setUser(res.data.user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  //  Handle login
  const login = async (email, password) => {
    try {
      const res = await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      setUser(res.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  //  Handle logout
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loadingUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
