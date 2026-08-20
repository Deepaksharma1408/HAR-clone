"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function SellPage() {
  const [address, setAddress] = useState("");
  const [beds, setBeds] = useState("4");
  const [baths, setBaths] = useState("3.5");
  const [sqft, setSqft] = useState("3400");
  const [condition, setCondition] = useState("Excellent");
  const [timeline, setTimeline] = useState("Within 30 Days");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <Header />

      <main className="estateline-container py-12 space-y-12">
        {/* Seller Hero */}
        <div className="bg-surface border border-line rounded-[20px] p-8 md:p-12 shadow-sm space-y-6">
          <div className="max-w-3xl">
            <EyebrowLabel>Sell & List Your Property</EyebrowLabel>
            <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-ink mt-2 tracking-tight">
              List Your Texas Home with Estateline<span className="text-brass">.</span>
            </h1>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              Connect with top-producing local Texas listing agents, get an in-depth Comparative Market Analysis (CMA), and feature your property across our premier buyer network.
            </p>
          </div>
        </div>

        {/* Valuation & Listing Consultation Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-surface border border-line rounded-[20px] p-8 shadow-sm space-y-6">
            <h2 className="font-fraunces text-2xl font-bold text-ink">Request Custom Home Listing Strategy</h2>

            {submitted ? (
              <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[12px] text-center space-y-3">
                <div className="text-2xl">🎉</div>
                <h3 className="font-fraunces text-xl font-bold text-emerald-950">Valuation Request Received!</h3>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                  A senior Estateline listing advisor is reviewing recent sales data for <strong className="text-emerald-950">{address || "your property"}</strong> and will reach out within 2 hours with your custom CMA report.
                </p>
                <Button onClick={() => setSubmitted(false)} variant="outline" size="sm">
                  Submit Another Request
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase text-ink-soft mb-1">Property Address</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 1402 Memorial Drive, Houston, TX"
                    className="w-full px-4 py-2.5 bg-bg border border-line rounded-[8px] text-xs font-inter focus:outline-none focus:border-brass"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-ink-soft mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={beds}
                      onChange={(e) => setBeds(e.target.value)}
                      className="w-full px-4 py-2.5 bg-bg border border-line rounded-[8px] text-xs font-inter focus:outline-none focus:border-brass"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-ink-soft mb-1">Bathrooms</label>
                    <input
                      type="text"
                      value={baths}
                      onChange={(e) => setBaths(e.target.value)}
                      className="w-full px-4 py-2.5 bg-bg border border-line rounded-[8px] text-xs font-inter focus:outline-none focus:border-brass"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-ink-soft mb-1">Approx Sq Ft</label>
                    <input
                      type="number"
                      value={sqft}
                      onChange={(e) => setSqft(e.target.value)}
                      className="w-full px-4 py-2.5 bg-bg border border-line rounded-[8px] text-xs font-inter focus:outline-none focus:border-brass"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-ink-soft mb-1">Home Condition</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className="w-full px-4 py-2.5 bg-bg border border-line rounded-[8px] text-xs font-inter focus:outline-none focus:border-brass"
                    >
                      <option>Newly Renovated</option>
                      <option>Excellent</option>
                      <option>Good</option>
                      <option>Needs Repairs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-ink-soft mb-1">Selling Timeline</label>
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full px-4 py-2.5 bg-bg border border-line rounded-[8px] text-xs font-inter focus:outline-none focus:border-brass"
                    >
                      <option>As Soon As Possible</option>
                      <option>Within 30 Days</option>
                      <option>1 to 3 Months</option>
                      <option>Just Curious / Researching</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brass hover:bg-brass-deep text-white font-inter font-bold text-xs rounded-[8px] transition-colors shadow-md cursor-pointer"
                >
                  Request Official Agent Valuation & Strategy →
                </button>
              </form>
            )}
          </div>

          {/* Seller Benefits Card */}
          <div className="space-y-6">
            <Card className="bg-surface p-6 rounded-[16px] border border-line space-y-4 shadow-sm">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-mono uppercase rounded-full">
                Why List With Estateline?
              </span>
              <ul className="space-y-3 text-xs font-inter">
                <li className="flex items-start gap-2">
                  <span className="text-brass font-bold">✓</span>
                  <span><strong>High Definition Virtual Tours:</strong> Architectural drone footage & 3D walkthroughs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brass font-bold">✓</span>
                  <span><strong>Maximum Exposure:</strong> Instant syndication to major buyer networks & active Texas buyers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brass font-bold">✓</span>
                  <span><strong>Expert Negotiation:</strong> Senior listing advisors with average 98.4% list-to-sale ratio.</span>
                </li>
              </ul>
            </Card>

            <div className="bg-gradient-to-br from-ink to-slate-900 text-white rounded-[16px] p-6 space-y-4 shadow-md">
              <h3 className="font-fraunces text-xl font-bold">Prefer Direct Agent Consultation?</h3>
              <p className="text-xs text-gray-300">
                Browse our directory of top-ranked Texas listing agents and schedule an in-person walkthrough.
              </p>
              <Link href="/agents">
                <button className="w-full py-2.5 bg-white text-ink font-inter font-bold text-xs rounded-[8px] hover:bg-gray-100 transition-colors shadow-sm cursor-pointer mt-2">
                  Find a Listing Agent →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
