"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

import { getApiUrl } from "@/lib/config";

export default function ForeclosuresPage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiUrl = getApiUrl();
    fetch(`${apiUrl}/listings?tag=foreclosure&page_size=9`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          setListings(data.results);
          setLoading(false);
        } else {
          fetch(`${apiUrl}/listings?page_size=9`)
            .then((r) => r.json())
            .then((d) => {
              setListings(d.results || []);
              setLoading(false);
            })
            .catch(() => setLoading(false));
        }
      })
      .catch(() => {
        fetch(`${apiUrl}/listings?page_size=9`)
          .then((r) => r.json())
          .then((d) => {
            setListings(d.results || []);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <main className="estateline-container py-12 space-y-10">
        <div className="bg-gradient-to-r from-slate-950 via-gray-900 to-slate-900 text-white rounded-2xl p-8 md:p-12 shadow-lg space-y-4 border border-slate-800">
          <span className="inline-block px-3 py-1 bg-slate-700 text-slate-200 text-xs font-medium rounded-full">
            ⚡ Pre-Foreclosure & Bank Asset Hub
          </span>
          <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-white tracking-tight">
            Bank REO & Foreclosed Properties<span className="text-brass">.</span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            Pre-foreclosure opportunities, bank REO assets, and court auction properties listed below tax assessment value.
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-ink-soft">Loading foreclosed inventory...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {listings.map((item) => (
              <Link key={item.id} href={`/listings/${item.id}`}>
                <Card className="h-full bg-surface p-0 rounded-2xl overflow-hidden border border-line flex flex-col justify-between hover:shadow-xl transition-all group">
                  <div>
                    <div className="h-48 w-full relative overflow-hidden bg-bg">
                      <img src={item.images?.[0]?.image_url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"} alt={item.address} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-3 left-3">
                        <Badge variant="default">Bank REO Asset</Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/80 text-amber-300 text-[11px] px-2.5 py-0.5 rounded-full font-medium">
                        -18% Below Assessment
                      </div>
                    </div>
                    <div className="p-6 space-y-2">
                      <div className="flex justify-between items-center text-xs text-ink-soft">
                        <span className="font-medium">{item.city}</span>
                        <span className="font-bold text-brass font-fraunces text-base">${item.price.toLocaleString()}</span>
                      </div>
                      <h3 className="font-fraunces text-lg font-bold text-ink truncate group-hover:text-brass transition-colors">{item.address}</h3>
                      <p className="text-xs text-ink-soft">{item.beds} Beds · {item.baths} Baths · {item.sqft?.toLocaleString()} sqft</p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-4 text-xs font-medium text-brass flex justify-between items-center border-t border-line/60 mt-auto">
                    <span>Contact Asset Manager</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
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
