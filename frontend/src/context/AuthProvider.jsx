import { useState, useEffect } from "react";
import {
  loginAPI,
  registerAPI,
  getProfileAPI,
  logoutAPI,
} from "../services/auth";
import AuthContext from "./AuthContext.jsx";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const data = await loginAPI(email, password);
    // Backend returns: { user, accessToken, refreshToken }
    setToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem("token", data.accessToken);
    return data;
  };

  const register = async (userData) => {
    const data = await registerAPI(userData);
    setToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem("token", data.accessToken);
    return data;
  };

  const logout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Logout API call failed", error);
    } finally {
      // Always clear local state, even if API fails
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      // If no token, we are not logged in. Stop loading.
      if (!token) {
        setLoading(false);
        return;
      }

      // If token exists and user is already loaded, we are good. Stop loading.
      if (user) {
        setLoading(false);
        return;
      }

      // Token exists, but user is null. We must fetch profile.
      try {
        const data = await getProfileAPI(token);
        if (data && data.user) {
          setUser(data.user);
        } else {
          throw new Error("Token valid but no user data returned");
        }
      } catch (err) {
        console.error("Session expired or invalid:", err);
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [token, user]);

  return (
    <AuthContext.Provider
      value={{ user, token, login, register, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};
