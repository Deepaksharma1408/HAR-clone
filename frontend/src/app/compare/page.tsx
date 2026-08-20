"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFavorites } from "@/context/FavoritesContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ComparePage() {
  const { favoriteIds } = useFavorites();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteListings = async () => {
      setLoading(true);
      try {
        if (!favoriteIds || favoriteIds.length === 0) {
          // If no favorites, fetch top 3 default listings for demo comparison
          const res = await fetch(`${API_URL}/listings?page_size=3`);
          if (res.ok) {
            const data = await res.json();
            setProperties(data.results || []);
          }
        } else {
          // Fetch favorite details
          const fetched = await Promise.all(
            favoriteIds.slice(0, 4).map(async (id: number) => {
              const res = await fetch(`${API_URL}/listings/${id}`);
              if (res.ok) return await res.json();
              return null;
            })
          );
          setProperties(fetched.filter(Boolean));
        }
      } catch (err) {
        console.error("Error fetching comparison properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteListings();
  }, [favoriteIds]);

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <Header />

      <main className="estateline-container py-12 space-y-10">
        {/* Header */}
        <div className="bg-surface border border-line rounded-[20px] p-8 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <EyebrowLabel>Architectural Decision Matrix</EyebrowLabel>
              <h1 className="font-fraunces text-3xl md:text-4xl font-bold text-ink mt-1">
                Side-by-Side Property Comparison<span className="text-brass">.</span>
              </h1>
              <p className="text-xs text-ink-soft mt-1">
                Compare price per square foot, beds/baths, lot acres, location, and estimated monthly payments across saved properties.
              </p>
            </div>

            <Link href="/listings">
              <Button variant="outline" size="sm">
                + Add Properties to Compare
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono uppercase text-ink-soft">Loading comparison matrix...</div>
        ) : properties.length === 0 ? (
          <Card className="p-12 text-center space-y-4">
            <h3 className="font-fraunces text-2xl font-bold text-ink">No Properties Selected</h3>
            <p className="text-xs text-ink-soft">Save properties to your favorites or click below to browse listings to compare.</p>
            <Link href="/listings">
              <Button variant="brass">Explore Listings →</Button>
            </Link>
          </Card>
        ) : (
          /* Comparison Matrix Table */
          <div className="bg-surface border border-line rounded-[20px] overflow-hidden shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-inter border-collapse">
                <thead>
                  <tr className="bg-bg/80 border-b border-line text-ink-soft font-mono uppercase">
                    <th className="p-5 w-48 font-bold border-r border-line">Attribute / Metric</th>
                    {properties.map((p) => (
                      <th key={p.id} className="p-5 min-w-[240px] border-r border-line text-center">
                        <div className="h-32 rounded-[10px] overflow-hidden mb-3 bg-bg">
                          <img
                            src={p.images?.[0]?.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"}
                            alt={p.address}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="font-fraunces font-bold text-sm text-ink truncate">{p.address}</h4>
                        <span className="text-[10px] font-mono text-ink-soft uppercase">{p.city}, TX</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {/* Price */}
                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-5 font-bold text-ink border-r border-line bg-bg/20">Asking Price</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-5 text-center font-fraunces font-bold text-lg text-brass border-r border-line">
                        ${p.price?.toLocaleString()}
                      </td>
                    ))}
                  </tr>

                  {/* $/sqft */}
                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-5 font-bold text-ink border-r border-line bg-bg/20">Price / Sq Ft</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-5 text-center font-bold text-ink border-r border-line">
                        ${p.sqft ? Math.round(p.price / p.sqft) : "N/A"} / sqft
                      </td>
                    ))}
                  </tr>

                  {/* Bedrooms / Baths */}
                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-5 font-bold text-ink border-r border-line bg-bg/20">Beds / Baths</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-5 text-center text-ink-soft border-r border-line">
                        <strong className="text-ink font-bold">{p.beds} Beds</strong> · {p.baths} Baths
                      </td>
                    ))}
                  </tr>

                  {/* Sqft */}
                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-5 font-bold text-ink border-r border-line bg-bg/20">Interior Sqft</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-5 text-center text-ink-soft border-r border-line">
                        {p.sqft ? `${p.sqft.toLocaleString()} sqft` : "N/A"}
                      </td>
                    ))}
                  </tr>

                  {/* Property Type */}
                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-5 font-bold text-ink border-r border-line bg-bg/20">Property Type</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-5 text-center text-ink-soft border-r border-line">
                        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-full text-[11px]">
                          {p.type}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Est. Monthly Mortgage */}
                  <tr className="hover:bg-bg/40 transition-colors">
                    <td className="p-5 font-bold text-ink border-r border-line bg-bg/20">Est. Monthly Mortgage</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-5 text-center font-bold text-emerald-700 border-r border-line">
                        ${Math.round((p.price * 0.8 * 0.063) / 12 + (p.price * 0.022) / 12).toLocaleString()} / mo
                      </td>
                    ))}
                  </tr>

                  {/* Action Link */}
                  <tr className="bg-bg/30">
                    <td className="p-5 font-bold text-ink border-r border-line">Full Specs</td>
                    {properties.map((p) => (
                      <td key={p.id} className="p-5 text-center border-r border-line">
                        <Link href={`/listings/${p.id}`}>
                          <Button variant="brass" size="sm" className="w-full">Inspect Property →</Button>
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
