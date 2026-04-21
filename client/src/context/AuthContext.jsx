import React, { createContext, useState, useCallback, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password, role) => {
    try {
      setError(null);
      let endpoint = "/api/auth/login"; // default for customer

      if (role === "theatreAdmin") {
        endpoint = "/api/auth/theatre/login";
      } else if (role === "superadmin") {
        endpoint = "/api/auth/superadmin/login";
      }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const userData = { ...data.user, role: data.user.role || role };
      setUser(userData);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (formData) => {
    try {
      setError(null);

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      const userData = { ...data.user, role: data.user.role };
      setUser(userData);
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } catch (err) {
      console.error("Logout error:", err);
    }
  }, []);

  const setAuthUser = useCallback((userData, token) => {
    setUser(userData);
    if (token) {
      localStorage.setItem("accessToken", token);
    }
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }, []);

  const isAuthenticated = !!user;
  const userRole = user?.role;
  const userTheatreId = user?.theatreId;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        setAuthUser,
        isAuthenticated,
        userRole,
        userTheatreId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
