"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getApiUrl } from "@/lib/config";

interface ComparableProperty {
  id: number;
  address: string;
  city: string;
  price: number;
  price_formatted: string;
  sqft: number | null;
  beds: number | null;
  baths: number | null;
  image_url: string | null;
}

interface ValuationData {
  address: string;
  city: string;
  estimated_value: number;
  estimated_value_formatted: string;
  low_range: number;
  low_range_formatted: string;
  high_range: number;
  high_range_formatted: string;
  price_per_sqft: number;
  confidence_score: number;
  appreciation_1yr_pct: number;
  comparables: ComparableProperty[];
}

export default function HomeValuePage() {
  const [address, setAddress] = useState("1204 Oak Ridge Lane");
  const [city, setCity] = useState("Katy");
  const [beds, setBeds] = useState("4");
  const [baths, setBaths] = useState("3.5");
  const [sqft, setSqft] = useState("3200");
  const [condition, setCondition] = useState("Good");

  const [data, setData] = useState<ValuationData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchValuation = async (targetAddress: string, targetCity: string, targetSqft: string, targetBeds: string, targetBaths: string, targetCondition: string) => {
    setIsCalculating(true);
    setError(null);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/valuation/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: targetAddress,
          city: targetCity,
          beds: parseInt(targetBeds) || 4,
          baths: parseFloat(targetBaths) || 3.0,
          sqft: parseInt(targetSqft) || 3000,
          condition: targetCondition,
        }),
      });

      if (res.ok) {
        const valData: ValuationData = await res.json();
        setData(valData);
      } else {
        const err = await res.json();
        setError(err.detail || "Unable to compute valuation.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error communicating with valuation engine.");
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    fetchValuation(address, city, sqft, beds, baths, condition);
  }, []);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    fetchValuation(address, city, sqft, beds, baths, condition);
  };

  const estimatedVal = data?.estimated_value || 540000;
  const priceSqft = data?.price_per_sqft || Math.round(estimatedVal / (parseFloat(sqft) || 3200));

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <main className="estateline-container py-12 space-y-12">
        {/* Hero Section */}
        <div className="bg-surface border border-line rounded-2xl p-8 md:p-12 shadow-sm space-y-8">
          <div className="max-w-3xl">
            <EyebrowLabel>Automated Valuation Model (AVM)</EyebrowLabel>
            <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-ink mt-2 tracking-tight">
              Instant Texas Home Value Estimator<span className="text-brass">.</span>
            </h1>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              Get an accurate automated market value range, 12-month appreciation trends, price per square foot analytics, and comparative market analysis (CMA) for any Texas home.
            </p>
          </div>

          {/* Calculator Input Form */}
          <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-bg p-6 rounded-xl border border-line">
            <div className="md:col-span-2">
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Property Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                placeholder="e.g. 1204 Oak Ridge Lane"
                required
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">City / Region</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
              >
                <option>Katy</option>
                <option>Memorial</option>
                <option>The Heights</option>
                <option>Sugar Land</option>
                <option>Houston</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Square Feet</label>
              <input
                type="number"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                placeholder="3200"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full py-2.5 bg-brass hover:bg-brass-deep text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isCalculating ? "Calculating..." : "Get Instant Estimate →"}
              </button>
            </div>
          </form>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              {error}
            </div>
          )}
        </div>

        {/* Valuation Results Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Market Value Card */}
          <div className="bg-surface border-2 border-brass/50 rounded-2xl p-8 space-y-4 shadow-md text-center">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-medium rounded-full">
              Estimated Market Value
            </span>
            <div className="font-fraunces text-4xl md:text-5xl font-bold text-brass">
              {data ? data.estimated_value_formatted : `$${estimatedVal.toLocaleString()}`}
            </div>
            <div className="text-xs text-emerald-600 font-semibold font-inter">
              +{data?.appreciation_1yr_pct || 4.8}% Annual Market Appreciation ↑
            </div>
            <div className="text-xs text-ink-soft border-t border-line pt-3">
              Estimated Value Range:{" "}
              <span className="font-semibold text-ink">
                {data ? `${data.low_range_formatted} – ${data.high_range_formatted}` : `$${(estimatedVal * 0.94).toLocaleString()} – $${(estimatedVal * 1.07).toLocaleString()}`}
              </span>
            </div>
          </div>

          {/* $/sqft & Rental Metrics */}
          <div className="bg-surface border border-line rounded-2xl p-8 space-y-6 shadow-sm">
            <h3 className="font-fraunces text-xl font-bold text-ink">Property Analytics</h3>
            <div className="space-y-4 text-xs font-inter">
              <div className="flex justify-between py-2 border-b border-line">
                <span className="text-ink-soft">Price / Square Foot</span>
                <span className="font-semibold text-ink">${priceSqft}/sqft</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line">
                <span className="text-ink-soft">Estimated Monthly Rent</span>
                <span className="font-semibold text-emerald-700">${Math.round(estimatedVal * 0.007).toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line">
                <span className="text-ink-soft">Estimated Property Tax</span>
                <span className="font-semibold text-ink">${Math.round(estimatedVal * 0.021).toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-ink-soft">Confidence Score</span>
                <span className="font-semibold text-blue-600">{data?.confidence_score || 94}% (High Accuracy)</span>
              </div>
            </div>
          </div>

          {/* Certified Appraisal Request */}
          <div className="bg-gradient-to-br from-ink to-slate-900 text-white rounded-2xl p-8 flex flex-col justify-between shadow-lg">
            <div>
              <span className="inline-block px-3 py-1 bg-brass text-white text-xs font-medium rounded-full mb-3">
                Official Agent Appraisal
              </span>
              <h3 className="font-fraunces text-2xl font-bold mb-2">Need a Certified In-Person Appraisal?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Connect with our local licensed Texas real estate experts for a comprehensive in-person Comparative Market Analysis (CMA).
              </p>
            </div>
            <Link href="/sell" className="mt-6">
              <button className="w-full py-3 bg-white text-ink font-medium text-xs rounded-lg hover:bg-gray-100 transition-colors shadow-xs cursor-pointer">
                Request Agent Appraisal →
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Comparable Sales (Comps Table from DB) */}
        <div className="bg-surface border border-line rounded-2xl p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <EyebrowLabel>Market Intelligence</EyebrowLabel>
              <h2 className="font-fraunces text-2xl font-bold text-ink">Live Database Comparable Sales (Comps)</h2>
            </div>
            <Link href={`/listings?city=${encodeURIComponent(city)}`}>
              <Button variant="ghost" size="sm">Explore All {city} Properties →</Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-inter">
              <thead>
                <tr className="border-b border-line text-ink-soft">
                  <th className="pb-3 font-medium">Property Address</th>
                  <th className="pb-3 font-medium">City</th>
                  <th className="pb-3 font-medium">Listing Price</th>
                  <th className="pb-3 font-medium">Specs</th>
                  <th className="pb-3 font-medium">Est. $/Sq Ft</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data?.comparables && data.comparables.length > 0 ? (
                  data.comparables.map((c) => (
                    <tr key={c.id} className="hover:bg-bg/50 transition-colors">
                      <td className="py-4 font-bold text-ink">{c.address}</td>
                      <td className="py-4 text-ink-soft">{c.city}</td>
                      <td className="py-4 font-bold text-brass">{c.price_formatted}</td>
                      <td className="py-4 text-ink-soft">{c.beds ? `${c.beds} bd, ` : ""}{c.baths ? `${c.baths} ba, ` : ""}{c.sqft ? `${c.sqft} sqft` : "-"}</td>
                      <td className="py-4 text-ink-soft">{c.sqft ? `$${Math.round(c.price / c.sqft)}/sqft` : "-"}</td>
                      <td className="py-4">
                        <Link href={`/listings/${c.id}`}>
                          <span className="text-brass hover:underline font-medium">View Property →</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-ink-soft">
                      Loading comparable listings from database...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
