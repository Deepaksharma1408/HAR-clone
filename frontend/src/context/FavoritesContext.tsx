"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";

export interface ListingItem {
  id: number;
  address: string;
  city: string;
  price: number;
  type: string;
  status: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  hue_color: string | null;
  images?: { id: number; image_url: string; order: number }[];
}

interface FavoritesContextType {
  favoriteIds: number[];
  favoriteListings: ListingItem[];
  favoriteCount: number;
  isFavorite: (listingId: number) => boolean;
  toggleFavorite: (listingId: number, e?: React.MouseEvent) => Promise<void>;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [favoriteListings, setFavoriteListings] = useState<ListingItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = async () => {
    if (!user) {
      setFavoriteListings([]);
      setFavoriteIds([]);
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("estateline_token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/favorites`, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (res.ok) {
        const data: ListingItem[] = await res.json();
        setFavoriteListings(data || []);
        setFavoriteIds((data || []).map((item) => item.id));
      } else if (res.status === 401) {
        setFavoriteListings([]);
        setFavoriteIds([]);
      }
    } catch {
      // Silently handle network interruptions for unauthenticated guests
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const isFavorite = (listingId: number) => {
    return favoriteIds.includes(listingId);
  };

  const toggleFavorite = async (listingId: number, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // If user is NOT logged in, redirect to login page instead of failing
    if (!user) {
      router.push("/login");
      return;
    }

    const currentlyFav = isFavorite(listingId);

    if (currentlyFav) {
      // Optimistic update
      setFavoriteIds((prev) => prev.filter((id) => id !== listingId));
      setFavoriteListings((prev) => prev.filter((item) => item.id !== listingId));

      try {
        await fetch(`${API_URL}/favorites/${listingId}`, {
          method: "DELETE",
          credentials: "include",
        });
      } catch (err) {
        console.error("Error removing favorite:", err);
        fetchFavorites(); // Re-sync on failure
      }
    } else {
      // Optimistic update ID
      setFavoriteIds((prev) => [...prev, listingId]);

      try {
        const res = await fetch(`${API_URL}/favorites/${listingId}`, {
          method: "POST",
          credentials: "include",
        });
        if (res.ok) {
          fetchFavorites(); // Re-fetch to get full listing object
        }
      } catch (err) {
        console.error("Error adding favorite:", err);
        fetchFavorites();
      }
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoriteListings,
        favoriteCount: favoriteIds.length,
        isFavorite,
        toggleFavorite,
        loading,
        refreshFavorites: fetchFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};
