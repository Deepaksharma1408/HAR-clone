"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { HouseSVGPlaceholder } from "@/components/HouseSVGPlaceholder";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { getImageUrl } from "@/lib/config";

export default function AccountFavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { favoriteListings, isFavorite, toggleFavorite, loading: favLoading } = useFavorites();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const formatPrice = (price: number, type: string) => {
    if (type === "For Rent") return `$${price.toLocaleString()}/mo`;
    return `$${price.toLocaleString()}`;
  };

  if (authLoading || favLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <div className="flex-1 flex items-center justify-center text-xs text-ink-soft">
          Retrieving saved portfolio...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <main className="flex-1 estateline-container py-12">
        <div className="mb-10 border-b border-line pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <EyebrowLabel>Saved Residences</EyebrowLabel>
            <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
              Your Favorite Properties<span className="text-brass">.</span>
            </h1>
          </div>
          <span className="text-xs text-ink-soft font-medium">
            {favoriteListings.length} {favoriteListings.length === 1 ? "Property" : "Properties"} Saved
          </span>
        </div>

        {favoriteListings.length === 0 ? (
          <Card hoverable={false} className="py-20 text-center space-y-4 max-w-md mx-auto bg-surface">
            <div className="text-brass text-3xl">♥</div>
            <h2 className="font-fraunces text-xl font-medium text-ink">No Saved Favorites</h2>
            <p className="text-xs text-ink-soft leading-relaxed">
              You haven&apos;t favorited any properties yet. Click the heart icon on any property card to save it to your portfolio.
            </p>
            <Link href="/listings">
              <Button variant="brass" size="sm">
                Explore Listings →
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteListings.map((item) => {
              const isFav = isFavorite(item.id);
              return (
                <Link key={item.id} href={`/listings/${item.id}`}>
                  <Card className="h-full flex flex-col justify-between group relative">
                    {/* Heart Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-surface/90 border border-line text-ink hover:text-danger transition-colors cursor-pointer"
                      title="Remove from Favorites"
                    >
                      <svg
                        className={`w-4 h-4 ${isFav ? "fill-danger text-danger" : "fill-none"}`}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>

                    <div>
                      <div className="h-48 w-full relative mb-3 overflow-hidden rounded-xl bg-bg">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={getImageUrl(item.images[0].image_url)}
                            alt={item.address}
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <HouseSVGPlaceholder index={item.id} hue={item.hue_color || "var(--sage-soft)"} />
                        )}
                        <div className="absolute top-3 left-3 z-10">
                          <Badge variant={item.type === "For Rent" ? "sage" : "brass"}>
                            {item.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-ink-soft">{item.city}</span>
                        <Badge variant="default">{item.status}</Badge>
                      </div>

                      <h3 className="font-fraunces text-base font-semibold text-ink group-hover:text-brass transition-colors truncate">
                        {item.address}
                      </h3>

                      <p className="text-xs text-ink-soft mt-1 mb-3">
                        {item.beds ? `${item.beds} Beds` : "Commercial"} ·{" "}
                        {item.baths ? `${item.baths} Baths` : ""} ·{" "}
                        {item.sqft ? `${item.sqft.toLocaleString()} sqft` : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-line mt-auto">
                      <span className="font-fraunces font-bold text-base text-brass">
                        {formatPrice(item.price, item.type)}
                      </span>
                      <span className="text-xs font-medium text-ink group-hover:text-brass group-hover:translate-x-1 transition-all">
                        Details →
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
