"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getApiUrl } from "@/lib/config";

interface NeighborhoodData {
  name: string;
  title: string;
  tagline: string;
  safety: string;
  walkScore: string;
  avgPrice: string;
  medianHome: string;
  activeListingsCount: number;
  highlights: string[];
  image: string;
}

export default function NeighborhoodsPage() {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodData[]>([]);
  const [selectedCity, setSelectedCity] = useState("Memorial");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNeighborhoods = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/neighborhoods`);
        if (res.ok) {
          const data: NeighborhoodData[] = await res.json();
          setNeighborhoods(data);
          if (data.length > 0) {
            setSelectedCity(data[0].name);
          }
        }
      } catch (err) {
        console.error("Failed to load neighborhoods", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNeighborhoods();
  }, []);

  const currentHood = neighborhoods.find((n) => n.name === selectedCity) || neighborhoods[0] || {
    name: "Memorial",
    title: "Piney Point & Memorial Villages",
    tagline: "Serene Wooded Estates & Elite School Districts",
    safety: "96 / 100",
    walkScore: "78 / 100",
    avgPrice: "$345 / sqft",
    medianHome: "$1,850,000",
    activeListingsCount: 8,
    highlights: ["Spring Branch ISD Schools", "Memorial City Mall & Medical Center", "Terry Hershey Park Trails"],
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <main className="estateline-container py-12 space-y-12">
        {/* Hero Section */}
        <div className="bg-surface border border-line rounded-2xl p-8 md:p-12 shadow-sm space-y-6">
          <div className="max-w-3xl">
            <EyebrowLabel>Community Intelligence</EyebrowLabel>
            <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-ink mt-2 tracking-tight">
              Texas Neighborhood Explorer<span className="text-brass">.</span>
            </h1>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              Discover top Texas communities. Compare neighborhood safety scores, walkability ratings, median home prices, school ratings, and local amenities powered by live MLS database statistics.
            </p>
          </div>

          {/* District Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line">
            {neighborhoods.map((n) => (
              <button
                key={n.name}
                onClick={() => setSelectedCity(n.name)}
                className={`px-5 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  selectedCity === n.name
                    ? "bg-brass text-white shadow-xs font-bold"
                    : "bg-bg text-ink border border-line hover:border-ink"
                }`}
              >
                {n.name} ({n.activeListingsCount} Homes)
              </button>
            ))}
          </div>
        </div>

        {/* Selected Neighborhood Highlight Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-surface border border-line rounded-2xl overflow-hidden p-6 md:p-8 shadow-md">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-900 text-xs font-medium rounded-full mb-2">
                Featured District · {currentHood.activeListingsCount} Live Listings
              </span>
              <h2 className="font-fraunces text-3xl font-bold text-ink">{currentHood.title}</h2>
              <p className="text-sm text-ink-soft mt-1.5">{currentHood.tagline}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-line text-xs">
              <div>
                <span className="text-ink-soft block">Safety Score</span>
                <span className="font-bold text-emerald-700 text-sm">{currentHood.safety}</span>
              </div>
              <div>
                <span className="text-ink-soft block">Walk Score</span>
                <span className="font-bold text-blue-700 text-sm">{currentHood.walkScore}</span>
              </div>
              <div>
                <span className="text-ink-soft block">Avg. Price / SqFt</span>
                <span className="font-bold text-ink text-sm">{currentHood.avgPrice}</span>
              </div>
              <div>
                <span className="text-ink-soft block">Median Home Price</span>
                <span className="font-bold text-brass text-sm">{currentHood.medianHome}</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-ink uppercase tracking-wider">Neighborhood Highlights</span>
              <div className="flex flex-wrap gap-2">
                {currentHood.highlights.map((h, i) => (
                  <span key={i} className="px-3 py-1 bg-bg border border-line rounded-lg text-xs text-ink-soft">
                    ✨ {h}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link href={`/listings?city=${encodeURIComponent(currentHood.name)}`}>
                <Button variant="brass" size="md">
                  Browse All {currentHood.name} Homes ({currentHood.activeListingsCount}) →
                </Button>
              </Link>
            </div>
          </div>

          <div className="h-72 w-full rounded-xl overflow-hidden border border-line shadow-inner">
            <img src={currentHood.image} alt={currentHood.title} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* All Neighborhoods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {neighborhoods.map((hood) => (
            <Card key={hood.name} className="bg-surface p-6 rounded-2xl border border-line flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="h-36 w-full rounded-xl overflow-hidden mb-3">
                  <img src={hood.image} alt={hood.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center">
                  <h3 className="font-fraunces text-xl font-bold text-ink">{hood.name}</h3>
                  <Badge variant="brass">{hood.activeListingsCount} Active</Badge>
                </div>
                <p className="text-xs text-ink-soft line-clamp-2">{hood.tagline}</p>
                <div className="text-xs text-ink-soft font-semibold">
                  Median: <span className="text-brass">{hood.medianHome}</span> · {hood.avgPrice}
                </div>
              </div>

              <Link href={`/listings?city=${encodeURIComponent(hood.name)}`} className="w-full">
                <Button variant="outline" size="sm" className="w-full">
                  Explore {hood.name} Properties →
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
