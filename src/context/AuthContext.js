import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios"; 
import API_URL from "../config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);
 useEffect(() => {
  const checkAuth = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    

    if (!token) return setLoading(false);
    if (token) { 
      try {
        const response = await axios.get(`${API_URL}/api/auth/user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsLoggedIn(true);
        setUser(response.data.user);
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("token"); // Remove invalid token
        setIsLoggedIn(false);
        setUser(null);
      }
    }
    setLoading(false); // Loading complete
  };
  checkAuth();
  }, []); 


  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      setUser(response.data.user);
    } catch (error) {
      console.error("Login failed:", error.response.data.message);
      throw error.response.data.message;
    }
  };

  const signup = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/signup`, { username, email, password });
      localStorage.setItem("token", response.data.token);
      setIsLoggedIn(true);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
    const errorMessage = error.response?.data?.details?.message || 
                        error.response?.data?.error ||
                        'Signup failed';
    throw errorMessage;
  }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
