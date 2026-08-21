"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getApiUrl } from "@/lib/config";

interface CommuteListingItem {
  id: number;
  address: string;
  city: string;
  price: number;
  price_formatted: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  estimated_minutes: number;
  image_url: string;
}

interface CommuteRadiusGroup {
  radius_label: string;
  color_badge: string;
  region_title: string;
  description: string;
  city: string;
  average_minutes: number;
  listings: CommuteListingItem[];
}

interface CommuteResponse {
  origin: string;
  max_minutes: number;
  mode: string;
  groups: CommuteRadiusGroup[];
}

export default function DriveTimePage() {
  const [origin, setOrigin] = useState("1000 Main St, Downtown Houston, TX");
  const [maxMinutes, setMaxMinutes] = useState(35);
  const [mode, setMode] = useState("Drive");
  const [data, setData] = useState<CommuteResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommuteData = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const params = new URLSearchParams({
          origin,
          max_minutes: maxMinutes.toString(),
          mode,
        });

        const res = await fetch(`${apiUrl}/commute/search?${params.toString()}`);
        if (res.ok) {
          const resData: CommuteResponse = await res.json();
          setData(resData);
        }
      } catch (err) {
        console.error("Commute query error", err);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchCommuteData, 250);
    return () => clearTimeout(timeout);
  }, [origin, maxMinutes, mode]);

  const badgeColorMap: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-900 border-emerald-300",
    blue: "bg-blue-100 text-blue-900 border-blue-300",
    amber: "bg-amber-100 text-amber-900 border-amber-300",
    purple: "bg-purple-100 text-purple-900 border-purple-300",
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <main className="estateline-container py-12 space-y-12">
        <div className="bg-surface border border-line rounded-2xl p-8 md:p-12 shadow-sm space-y-6">
          <div className="max-w-3xl">
            <EyebrowLabel>Real-Time Traffic Estimator</EyebrowLabel>
            <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-ink mt-2 tracking-tight">
              Commute & Drive Time Search<span className="text-brass">.</span>
            </h1>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              Find Texas homes based on maximum commute time to your office, medical center, or work location. Calculate drive time under rush hour peak traffic conditions.
            </p>
          </div>

          <div className="bg-bg p-6 rounded-xl border border-line space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Work / Origin Location</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Transport Mode</label>
                <div className="flex gap-1.5">
                  {["Drive", "Transit", "E-Bike"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2 rounded-lg text-xs font-inter font-medium transition-all cursor-pointer ${
                        mode === m ? "bg-brass text-white shadow-xs font-bold" : "bg-surface text-ink border border-line"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[13px] font-medium text-ink-soft">Maximum Commute Time</label>
                <span className="font-fraunces font-bold text-lg text-brass">{maxMinutes} Minutes (Peak Traffic)</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={maxMinutes}
                onChange={(e) => setMaxMinutes(parseInt(e.target.value))}
                className="w-full accent-brass cursor-pointer"
              />
            </div>
          </div>
        </div>

        {loading && !data ? (
          <div className="py-20 text-center text-ink-soft">
            <div className="inline-block w-8 h-8 border-2 border-brass border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs">Calculating traffic travel times from database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {data?.groups.map((group, idx) => (
              <Card key={idx} className="bg-surface p-6 rounded-2xl border border-line flex flex-col justify-between space-y-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${badgeColorMap[group.color_badge] || "bg-gray-100 text-gray-800"}`}>
                    ⚡ {group.radius_label}
                  </span>

                  <div>
                    <h3 className="font-fraunces text-xl font-bold text-ink">{group.region_title}</h3>
                    <p className="text-xs text-ink-soft leading-relaxed mt-1">{group.description}</p>
                  </div>

                  {group.listings && group.listings.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-line">
                      <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block">
                        Matching Homes in {group.city}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        {group.listings.slice(0, 2).map((l) => (
                          <Link key={l.id} href={`/listings/${l.id}`} className="group block">
                            <div className="h-20 w-full rounded-lg overflow-hidden relative border border-line">
                              <img src={l.image_url} alt={l.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              <div className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                {l.price_formatted}
                              </div>
                            </div>
                            <span className="text-[10px] text-ink-soft truncate block mt-0.5 group-hover:text-brass">
                              {l.address}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Link href={`/listings?city=${encodeURIComponent(group.city)}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View All Homes in {group.city} →
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
