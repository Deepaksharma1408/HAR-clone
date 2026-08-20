"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function DriveTimePage() {
  const [origin, setOrigin] = useState("1000 Main St, Downtown Houston, TX");
  const [maxMinutes, setMaxMinutes] = useState(25);
  const [mode, setMode] = useState("Drive");

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <Header />

      <main className="estateline-container py-12 space-y-12">
        <div className="bg-surface border border-line rounded-[20px] p-8 md:p-12 shadow-sm space-y-6">
          <div className="max-w-3xl">
            <EyebrowLabel>Real-Time Traffic Estimator</EyebrowLabel>
            <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-ink mt-2 tracking-tight">
              Commute & Drive Time Search<span className="text-brass">.</span>
            </h1>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              Find Texas homes based on maximum commute time to your office, school, or work location. Calculate drive time under rush hour peak traffic conditions.
            </p>
          </div>

          <div className="bg-bg p-6 rounded-[16px] border border-line space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-mono uppercase text-ink-soft mb-1">Work / Origin Location</label>
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-line rounded-[8px] text-xs font-inter focus:outline-none focus:border-brass"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-ink-soft mb-1">Transport Mode</label>
                <div className="flex gap-1.5">
                  {["Drive", "Transit", "E-Bike"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 py-2 rounded-[8px] text-xs font-inter font-bold transition-all cursor-pointer ${
                        mode === m ? "bg-brass text-white" : "bg-surface text-ink border border-line"
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
                <label className="text-xs font-mono uppercase text-ink-soft">Maximum Commute Time</label>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-surface p-6 rounded-[16px] border border-line space-y-4">
            <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-mono uppercase rounded-full">
              15-20 Min Commute Radius
            </span>
            <h3 className="font-fraunces text-xl font-bold text-ink">The Heights & Montrose</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Prime close-in neighborhood offering short 18-minute drive to Downtown HQ along I-10 and Memorial Drive.
            </p>
            <Link href="/listings?city=The+Heights">
              <Button variant="outline" size="sm" className="w-full">View Homes within 20 Mins →</Button>
            </Link>
          </Card>

          <Card className="bg-surface p-6 rounded-[16px] border border-line space-y-4">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 text-xs font-mono uppercase rounded-full">
              20-25 Min Commute Radius
            </span>
            <h3 className="font-fraunces text-xl font-bold text-ink">Memorial & Spring Branch</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Quiet wooded estates with direct Westpark Tollway access, average 24-minute drive time.
            </p>
            <Link href="/listings?city=Memorial">
              <Button variant="outline" size="sm" className="w-full">View Homes within 25 Mins →</Button>
            </Link>
          </Card>

          <Card className="bg-surface p-6 rounded-[16px] border border-line space-y-4">
            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-mono uppercase rounded-full">
              30-35 Min Commute Radius
            </span>
            <h3 className="font-fraunces text-xl font-bold text-ink">Greater Katy & Sugar Land</h3>
            <p className="text-xs text-ink-soft leading-relaxed">
              Master planned suburban communities with park-and-ride transit options, average 32-minute commute.
            </p>
            <Link href="/listings?city=Katy">
              <Button variant="outline" size="sm" className="w-full">View Homes within 35 Mins →</Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}
