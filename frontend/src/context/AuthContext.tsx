"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getApiUrl } from "@/lib/config";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "buyer" | "agent";
  agent_profile?: {
    id: number;
    role_title: string;
    bio: string | null;
  } | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUserState: (user: User | null, token?: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const setUserState = (userData: User | null, token?: string | null) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      if (userData) {
        localStorage.setItem("estateline_user", JSON.stringify(userData));
        if (token) {
          localStorage.setItem("estateline_token", token);
        }
      } else {
        localStorage.removeItem("estateline_user");
        localStorage.removeItem("estateline_token");
      }
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const apiUrl = getApiUrl();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (typeof window !== "undefined") {
        const token = localStorage.getItem("estateline_token");
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      const res = await fetch(`${apiUrl}/auth/me`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setUserState(data);
      } else if (res.status === 401) {
        if (typeof window !== "undefined" && !localStorage.getItem("estateline_token")) {
          setUserState(null);
        }
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("estateline_user");
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch (e) {}
      }
    }
    fetchCurrentUser();
  }, []);

  const logout = async () => {
    try {
      const apiUrl = getApiUrl();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("estateline_token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }
      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      setUserState(null);
    } catch (err) {
      console.error("Logout error:", err);
      setUserState(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser: fetchCurrentUser, setUserState }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
