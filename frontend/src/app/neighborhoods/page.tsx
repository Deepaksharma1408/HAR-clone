"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

export default function NeighborhoodsPage() {
  const [selectedCity, setSelectedCity] = useState("Memorial");

  const neighborhoods = [
    {
      name: "Memorial",
      title: "Piney Point & Memorial Villages",
      tagline: "Serene Wooded Estates & Elite School Districts",
      safety: "96 / 100",
      walkScore: "78 / 100",
      avgPrice: "$345 / sqft",
      medianHome: "$1,850,000",
      highlights: ["Spring Branch ISD Schools", "Memorial City Mall & Medical Center", "Terry Hershey Park Trails"],
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Katy",
      title: "Cinco Ranch & Greater Katy",
      tagline: "Master-Planned Communities & Top Family Living",
      safety: "94 / 100",
      walkScore: "72 / 100",
      avgPrice: "$225 / sqft",
      medianHome: "$585,000",
      highlights: ["Katy ISD 10/10 Schools", "LaCenterra Outdoor Town Center", "Water Parks & Lakes"],
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "The Heights",
      title: "Historic Houston Heights",
      tagline: "Walkable Historic Charm, Boutiques & Artisan Dining",
      safety: "91 / 100",
      walkScore: "92 / 100",
      avgPrice: "$360 / sqft",
      medianHome: "$890,000",
      highlights: ["19th Street Shopping District", "Heights Hike & Bike Trail", "Craft Breweries & Bistros"],
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    },
    {
      name: "Sugar Land",
      title: "First Colony & Telfair",
      tagline: "Lakeside Ranches & Vibrant Town Center",
      safety: "95 / 100",
      walkScore: "75 / 100",
      avgPrice: "$210 / sqft",
      medianHome: "$540,000",
      highlights: ["Fort Bend ISD Schools", "Smart Financial Centre Arena", "Sugar Land Town Square"],
      image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const currentHood = neighborhoods.find((n) => n.name === selectedCity) || neighborhoods[0];

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <Header />

      <main className="estateline-container py-12 space-y-12">
        {/* Hero Section */}
        <div className="bg-surface border border-line rounded-[20px] p-8 md:p-12 shadow-sm space-y-6">
          <div className="max-w-3xl">
            <EyebrowLabel>Community Intelligence</EyebrowLabel>
            <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-ink mt-2 tracking-tight">
              Texas Neighborhood Explorer<span className="text-brass">.</span>
            </h1>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              Discover top Texas communities. Compare neighborhood safety scores, walkability ratings, median home prices, school ratings, and local amenities.
            </p>
          </div>

          {/* District Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line">
            {neighborhoods.map((n) => (
              <button
                key={n.name}
                onClick={() => setSelectedCity(n.name)}
                className={`px-5 py-2.5 rounded-full text-xs font-inter font-bold transition-all cursor-pointer ${
                  selectedCity === n.name
                    ? "bg-brass text-white shadow-md"
                    : "bg-bg text-ink border border-line hover:border-ink"
                }`}
              >
                {n.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Neighborhood Highlight Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center bg-surface border border-line rounded-[20px] overflow-hidden p-6 md:p-8 shadow-md">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-900 text-xs font-inter font-bold rounded-full mb-2">
                Featured District
              </span>
              <h2 className="font-fraunces text-3xl font-bold text-ink">{currentHood.title}</h2>
              <p className="text-xs text-brass font-bold font-inter mt-1">{currentHood.tagline}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-bg p-4 rounded-[12px] border border-line text-center">
              <div>
                <div className="text-[10px] font-mono uppercase text-ink-soft">Safety Score</div>
                <div className="font-inter font-bold text-lg text-emerald-600">{currentHood.safety}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-ink-soft">Walk Score</div>
                <div className="font-inter font-bold text-lg text-amber-600">{currentHood.walkScore}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-ink-soft">Avg Price/sqft</div>
                <div className="font-inter font-bold text-lg text-ink">{currentHood.avgPrice}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-ink-soft">Median Home</div>
                <div className="font-inter font-bold text-lg text-brass">{currentHood.medianHome}</div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase text-ink-soft">Community Highlights:</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-inter font-bold text-ink">
                {currentHood.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 bg-bg px-3 py-2 rounded-[6px] border border-line/60">
                    <span className="text-brass">✓</span> {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2">
              <Link href={`/listings?city=${encodeURIComponent(currentHood.name)}`}>
                <Button size="lg">Explore {currentHood.name} Homes for Sale →</Button>
              </Link>
            </div>
          </div>

          <div className="h-full min-h-[260px] rounded-[16px] overflow-hidden shadow-inner border border-line">
            <img src={currentHood.image} alt={currentHood.name} className="w-full h-full object-cover" />
          </div>
        </div>
      </main>
    </div>
  );
}
