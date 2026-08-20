"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

export default function HomeValuePage() {
  const [address, setAddress] = useState("1204 Oak Ridge Lane, Katy, TX 77494");
  const [beds, setBeds] = useState("4");
  const [baths, setBaths] = useState("3.5");
  const [sqft, setSqft] = useState("3200");
  const [calculatedValue, setCalculatedValue] = useState(540000);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    setTimeout(() => {
      const baseSqft = parseFloat(sqft) || 2500;
      const newValue = Math.round(baseSqft * 168 + 150000);
      setCalculatedValue(newValue);
      setIsCalculating(false);
    }, 600);
  };

  const comps = [
    { address: "1208 Oak Ridge Lane", price: "$555,000", sqft: "3,350", soldDate: "2 weeks ago" },
    { address: "4509 Cinco Ranch Blvd", price: "$525,000", sqft: "3,100", soldDate: "1 month ago" },
    { address: "7400 Cypress Lake Ct", price: "$560,000", sqft: "3,400", soldDate: "2 months ago" },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <Header />

      <main className="estateline-container py-12 space-y-12">
        {/* Hero Section */}
        <div className="bg-surface border border-line rounded-[20px] p-8 md:p-12 shadow-sm space-y-8">
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
          <form onSubmit={handleCalculate} className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-bg p-6 rounded-[16px] border border-line">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase text-ink-soft mb-1">Property Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-line rounded-[8px] text-xs font-inter focus:outline-none focus:border-brass"
                placeholder="Enter full address..."
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase text-ink-soft mb-1">Square Feet</label>
              <input
                type="number"
                value={sqft}
                onChange={(e) => setSqft(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-line rounded-[8px] text-xs font-inter focus:outline-none focus:border-brass"
                placeholder="3200"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isCalculating}
                className="w-full py-2.5 bg-brass hover:bg-brass-deep text-white font-inter font-bold text-xs rounded-[8px] transition-colors cursor-pointer shadow-md"
              >
                {isCalculating ? "Calculating Valuation..." : "Get Instant Estimate →"}
              </button>
            </div>
          </form>
        </div>

        {/* Valuation Results Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Market Value Card */}
          <div className="bg-surface border-2 border-brass/50 rounded-[20px] p-8 space-y-4 shadow-md text-center">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-mono uppercase rounded-full">
              Estimated Market Value
            </span>
            <div className="font-fraunces text-4xl md:text-5xl font-bold text-brass">
              ${calculatedValue.toLocaleString()}
            </div>
            <div className="text-xs text-emerald-600 font-bold font-inter">
              +6.8% Annual Market Appreciation ↑
            </div>
            <div className="text-xs text-ink-soft border-t border-line pt-3">
              Estimated Value Range: <span className="font-bold text-ink">${(calculatedValue * 0.95).toLocaleString()} – ${(calculatedValue * 1.05).toLocaleString()}</span>
            </div>
          </div>

          {/* $/sqft & Rental Metrics */}
          <div className="bg-surface border border-line rounded-[20px] p-8 space-y-6 shadow-sm">
            <h3 className="font-fraunces text-xl font-bold text-ink">Property Analytics</h3>
            <div className="space-y-4 text-xs font-inter">
              <div className="flex justify-between py-2 border-b border-line">
                <span className="text-ink-soft">Price / Square Foot</span>
                <span className="font-bold text-ink">${Math.round(calculatedValue / (parseFloat(sqft) || 3200))}/sqft</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line">
                <span className="text-ink-soft">Estimated Monthly Rent</span>
                <span className="font-bold text-emerald-700">${Math.round(calculatedValue * 0.007).toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between py-2 border-b border-line">
                <span className="text-ink-soft">Estimated Property Tax</span>
                <span className="font-bold text-ink">${Math.round(calculatedValue * 0.021).toLocaleString()}/yr</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-ink-soft">Confidence Score</span>
                <span className="font-bold text-blue-600">94% (High Accuracy)</span>
              </div>
            </div>
          </div>

          {/* Certified Appraisal Request */}
          <div className="bg-gradient-to-br from-ink to-slate-900 text-white rounded-[20px] p-8 flex flex-col justify-between shadow-lg">
            <div>
              <span className="inline-block px-3 py-1 bg-brass text-white text-[10px] font-mono uppercase rounded-full mb-3">
                Official Agent Appraisal
              </span>
              <h3 className="font-fraunces text-2xl font-bold mb-2">Need a Certified In-Person Appraisal?</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Connect with our local licensed Texas real estate experts for a comprehensive in-person Comparative Market Analysis (CMA).
              </p>
            </div>
            <Link href="/agents" className="mt-6">
              <button className="w-full py-3 bg-white text-ink font-inter font-bold text-xs rounded-[8px] hover:bg-gray-100 transition-colors shadow-md cursor-pointer">
                Request Agent Appraisal →
              </button>
            </Link>
          </div>
        </div>

        {/* Recent Comparable Sales (Comps Table) */}
        <div className="bg-surface border border-line rounded-[20px] p-8 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <EyebrowLabel>Market Intelligence</EyebrowLabel>
              <h2 className="font-fraunces text-2xl font-bold text-ink">Recent Nearby Comparable Sales (Comps)</h2>
            </div>
            <Link href="/listings?city=Katy">
              <Button variant="ghost" size="sm">Explore Nearby Properties →</Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-inter">
              <thead>
                <tr className="border-b border-line text-ink-soft font-mono uppercase">
                  <th className="pb-3 font-semibold">Address</th>
                  <th className="pb-3 font-semibold">Sale Price</th>
                  <th className="pb-3 font-semibold">Sq Ft</th>
                  <th className="pb-3 font-semibold">Sold Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {comps.map((c, idx) => (
                  <tr key={idx} className="hover:bg-bg/50 transition-colors">
                    <td className="py-4 font-bold text-ink">{c.address}</td>
                    <td className="py-4 font-bold text-brass">{c.price}</td>
                    <td className="py-4 text-ink-soft">{c.sqft} sqft</td>
                    <td className="py-4 text-ink-soft">{c.soldDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
