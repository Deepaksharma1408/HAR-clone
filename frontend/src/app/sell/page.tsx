"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { MagneticButton } from "@/components/MagneticButton";
import { getApiUrl } from "@/lib/config";

export default function SellPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Houston");
  const [beds, setBeds] = useState("4");
  const [baths, setBaths] = useState("3.5");
  const [sqft, setSqft] = useState("3400");
  const [condition, setCondition] = useState("Excellent");
  const [timeline, setTimeline] = useState("Within 30 Days");
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/leads/seller`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name || "Property Owner",
          email: email || "homeowner@estateline.com",
          phone: phone || null,
          address,
          city,
          beds: beds || "4",
          baths: baths || "3",
          sqft: parseInt(sqft) || 3000,
          property_condition: condition,
          timeline,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const errData = await res.json();
        setError(errData.detail || "Unable to submit valuation request. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Network connection error. Please check server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <main className="estateline-container py-12 space-y-12">
        {/* Seller Hero */}
        <div className="bg-surface border border-line rounded-2xl p-8 md:p-12 shadow-sm space-y-6">
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
          <div className="lg:col-span-2 bg-surface border border-line rounded-2xl p-8 shadow-sm space-y-6">
            <h2 className="font-fraunces text-2xl font-bold text-ink">Request Custom Home Listing Strategy</h2>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.25 }}
                  className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center space-y-3"
                >
                  <div className="text-2xl">🎉</div>
                  <h3 className="font-fraunces text-xl font-bold text-emerald-950">Valuation Request Received!</h3>
                  <p className="text-xs text-emerald-800 leading-relaxed max-w-md mx-auto">
                    A senior Estateline listing advisor is reviewing recent sales data for <strong className="text-emerald-950">{address || "your property"}</strong> and will reach out to <strong className="text-emerald-950">{email}</strong> within 2 hours with your custom CMA report.
                  </p>
                  <Button onClick={() => { setSubmitted(false); setAddress(""); }} variant="outline" size="sm">
                    Submit Another Request
                  </Button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Your Full Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. john@example.com"
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Phone (Optional)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(713) 555-0199"
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Property Street Address</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 1402 Memorial Drive"
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">City</label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      >
                        <option>Houston</option>
                        <option>Katy</option>
                        <option>Memorial</option>
                        <option>The Heights</option>
                        <option>Sugar Land</option>
                        <option>The Woodlands</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Bedrooms</label>
                      <input
                        type="number"
                        value={beds}
                        onChange={(e) => setBeds(e.target.value)}
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Bathrooms</label>
                      <input
                        type="number"
                        step="0.5"
                        value={baths}
                        onChange={(e) => setBaths(e.target.value)}
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      />
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Est. SqFt</label>
                      <input
                        type="number"
                        value={sqft}
                        onChange={(e) => setSqft(e.target.value)}
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Property Condition</label>
                      <select
                        value={condition}
                        onChange={(e) => setCondition(e.target.value)}
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      >
                        <option>Newly Renovated</option>
                        <option>Excellent</option>
                        <option>Good</option>
                        <option>Needs Repairs</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Selling Timeline</label>
                      <select
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      >
                        <option>As Soon As Possible</option>
                        <option>Within 30 Days</option>
                        <option>1 to 3 Months</option>
                        <option>Just Curious / Researching</option>
                      </select>
                    </div>
                  </div>

                  <MagneticButton className="w-full">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-brass hover:bg-brass-deep text-white font-medium text-xs rounded-lg transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Submitting Request..." : "Request Official Agent Valuation & Strategy →"}
                    </button>
                  </MagneticButton>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* Seller Benefits Card */}
          <div className="space-y-6">
            <Card className="bg-surface p-6 rounded-2xl border border-line space-y-4">
              <h3 className="font-fraunces text-lg font-bold text-ink">Why Sell with Estateline?</h3>
              <ul className="space-y-3 text-xs text-ink-soft">
                <li className="flex items-start gap-2">
                  <span className="text-brass font-bold">✓</span>
                  <span><strong>Editorial Architectural Media:</strong> High-definition staging, photography, and video tours.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brass font-bold">✓</span>
                  <span><strong>Dynamic Buyer Matching:</strong> Instant automated alerts sent to pre-qualified buyers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brass font-bold">✓</span>
                  <span><strong>Maximum Net Proceeds:</strong> Strategic pricing based on granular neighborhood analytics.</span>
                </li>
              </ul>
            </Card>

            <Card className="bg-[#FAF9F5] p-6 rounded-2xl border border-line space-y-3">
              <div className="text-xs font-medium text-brass uppercase tracking-wider">Direct Advisor Hotline</div>
              <div className="font-fraunces text-xl font-bold text-ink">(713) 555-0188</div>
              <p className="text-[11px] text-ink-soft">Available Mon-Sat 8:00 AM – 7:00 PM CST for instant valuation discussions.</p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
