"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function NewHomesPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/listings?tag=new_construction&page_size=9`)
      .then((res) => res.json())
      .then((data) => {
        setListings(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <Header />
      <main className="estateline-container py-12 space-y-10">
        <div className="bg-gradient-to-r from-pink-950 via-rose-900 to-pink-900 text-white rounded-[20px] p-8 md:p-12 shadow-lg space-y-4">
          <span className="inline-block px-3 py-1 bg-pink-500/30 text-pink-200 text-xs font-mono uppercase rounded-full border border-pink-400/30">
            🎀 2026 Master Planned Builders
          </span>
          <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-white tracking-tight">
            New Construction & Newly Built Estates<span className="text-brass">.</span>
          </h1>
          <p className="text-sm text-pink-200 leading-relaxed max-w-3xl">
            Explore newly constructed homes backed by 10-Year Builder Structural Warranties, EnergyStar efficiency, and custom luxury finishes.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono uppercase text-ink-soft">Loading new construction portfolio...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {listings.map((item) => (
              <Link key={item.id} href={`/listings/${item.id}`}>
                <Card className="h-full bg-surface p-0 rounded-[16px] overflow-hidden border border-line flex flex-col justify-between hover:shadow-xl transition-all group">
                  <div>
                    <div className="h-48 w-full relative overflow-hidden bg-bg">
                      <img src={item.images?.[0]?.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"} alt={item.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <Badge variant="brass">NEW CONSTRUCTION</Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/75 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                        10-Yr Warranty Included
                      </div>
                    </div>
                    <div className="p-6 space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono uppercase text-ink-soft">
                        <span>{item.city}</span>
                        <span className="font-bold text-brass font-fraunces text-base">${item.price.toLocaleString()}</span>
                      </div>
                      <h3 className="font-fraunces text-lg font-bold text-ink truncate group-hover:text-brass transition-colors">{item.address}</h3>
                      <p className="text-xs text-ink-soft">{item.beds} Beds · {item.baths} Baths · {item.sqft?.toLocaleString()} sqft</p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-0 text-xs font-mono uppercase text-brass font-bold flex justify-between items-center border-t border-line/60 pt-4 mt-auto">
                    <span>View Builder Specs</span>
                    <span>→</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
