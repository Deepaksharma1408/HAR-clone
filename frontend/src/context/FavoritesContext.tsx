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

  // Initialize from localStorage on first mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("estateline_favorites_ids");
      if (stored) {
        const ids = JSON.parse(stored);
        if (Array.isArray(ids)) {
          setFavoriteIds(ids);
        }
      }
    } catch {}
  }, []);

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("estateline_token");
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  const fetchFavorites = async () => {
    // If not logged in, fetch listing details for locally stored favoriteIds
    if (!user) {
      const stored = localStorage.getItem("estateline_favorites_ids");
      if (stored) {
        try {
          const ids: number[] = JSON.parse(stored);
          if (ids.length > 0) {
            const res = await fetch(`${API_URL}/listings?page_size=36`);
            if (res.ok) {
              const data = await res.json();
              const matched = (data.results || []).filter((l: ListingItem) => ids.includes(l.id));
              setFavoriteListings(matched);
            }
          }
        } catch {}
      }
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/favorites`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (res.ok) {
        const data: ListingItem[] = await res.json();
        setFavoriteListings(data || []);
        const ids = (data || []).map((item) => item.id);
        setFavoriteIds(ids);
        try {
          localStorage.setItem("estateline_favorites_ids", JSON.stringify(ids));
        } catch {}
      }
    } catch {
      // Silently handle network interruptions
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

    const currentlyFav = isFavorite(listingId);
    const updatedIds = currentlyFav
      ? favoriteIds.filter((id) => id !== listingId)
      : [...favoriteIds, listingId];

    // 1. Instant optimistic state update
    setFavoriteIds(updatedIds);
    try {
      localStorage.setItem("estateline_favorites_ids", JSON.stringify(updatedIds));
    } catch {}

    if (currentlyFav) {
      setFavoriteListings((prev) => prev.filter((item) => item.id !== listingId));
    }

    // 2. Sync with backend API
    const token = typeof window !== "undefined" ? localStorage.getItem("estateline_token") : null;
    if (user || token) {
      try {
        if (currentlyFav) {
          await fetch(`${API_URL}/favorites/${listingId}`, {
            method: "DELETE",
            headers: getAuthHeaders(),
            credentials: "include",
          });
        } else {
          const res = await fetch(`${API_URL}/favorites/${listingId}`, {
            method: "POST",
            headers: getAuthHeaders(),
            credentials: "include",
          });
          if (res.ok) {
            fetchFavorites();
          }
        }
      } catch (err) {
        console.error("Error syncing favorite:", err);
      }
    } else if (!currentlyFav) {
      // For guest, fetch listing item to display in favorites immediately
      try {
        const res = await fetch(`${API_URL}/listings/${listingId}`);
        if (res.ok) {
          const single = await res.json();
          setFavoriteListings((prev) => [...prev.filter((p) => p.id !== listingId), single]);
        }
      } catch {}
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
