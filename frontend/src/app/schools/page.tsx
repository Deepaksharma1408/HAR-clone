"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

export default function SchoolsPage() {
  const [district, setDistrict] = useState("katy");
  const [levelFilter, setLevelFilter] = useState("all");

  const schools = [
    {
      name: "Seven Lakes High School",
      district: "Katy ISD",
      rating: "10/10",
      level: "High",
      students: "3,200",
      ratio: "16:1",
      city: "Katy",
      address: "9251 S Fry Rd, Katy, TX",
    },
    {
      name: "Memorial High School",
      district: "Spring Branch ISD",
      rating: "10/10",
      level: "High",
      students: "2,600",
      ratio: "15:1",
      city: "Memorial",
      address: "935 Echo Ln, Houston, TX",
    },
    {
      name: "Beckendorff Junior High",
      district: "Katy ISD",
      rating: "9/10",
      level: "Middle",
      students: "1,450",
      ratio: "14:1",
      city: "Katy",
      address: "8200 S Fry Rd, Katy, TX",
    },
    {
      name: "Frostwood Elementary School",
      district: "Spring Branch ISD",
      rating: "10/10",
      level: "Elementary",
      students: "720",
      ratio: "13:1",
      city: "Memorial",
      address: "12214 Memorial Dr, Houston, TX",
    },
  ];

  const filteredSchools = schools.filter(
    (s) =>
      (district === "all" || s.district.toLowerCase().includes(district)) &&
      (levelFilter === "all" || s.level === levelFilter)
  );

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <main className="estateline-container py-12 space-y-12">
        {/* Header Hero */}
        <div className="bg-surface border border-line rounded-2xl p-8 md:p-12 shadow-sm space-y-6">
          <div className="max-w-3xl">
            <EyebrowLabel>GreatSchools Certified</EyebrowLabel>
            <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-ink mt-2 tracking-tight">
              Texas School Finder & Ratings Guide<span className="text-brass">.</span>
            </h1>
            <p className="text-sm text-ink-soft mt-3 leading-relaxed">
              Search top-rated Texas public and private school districts, compare GreatSchools ratings, student-teacher ratios, and browse homes for sale within top school attendance boundaries.
            </p>
          </div>

          {/* District & Level Filter Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-bg p-4 rounded-xl border border-line">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-ink-soft mr-2">District:</span>
              {[
                { id: "all", label: "All Districts" },
                { id: "katy", label: "Katy ISD" },
                { id: "spring", label: "Spring Branch ISD" },
                { id: "houston", label: "Houston ISD" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDistrict(d.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    district === d.id ? "bg-brass text-white shadow-xs" : "bg-surface text-ink border border-line hover:border-ink"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-soft mr-1">Level:</span>
              {["all", "Elementary", "Middle", "High"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(lvl)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    levelFilter === lvl ? "bg-ink text-white" : "bg-surface text-ink-soft hover:text-ink"
                  }`}
                >
                  {lvl === "all" ? "All Levels" : lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* School Directory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSchools.map((s, idx) => (
            <Card key={idx} className="bg-surface p-6 rounded-2xl border border-line flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs font-medium text-brass">{s.district}</span>
                    <h3 className="font-fraunces text-xl font-bold text-ink mt-0.5">{s.name}</h3>
                  </div>
                  <div className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-semibold text-xs px-3 py-1 rounded-full">
                    {s.rating}
                  </div>
                </div>

                <p className="text-xs text-ink-soft mb-4">{s.address}</p>

                <div className="grid grid-cols-3 gap-2 bg-bg p-3.5 rounded-xl text-center border border-line text-xs font-inter">
                  <div>
                    <div className="text-xs font-medium text-ink-soft">Grade Level</div>
                    <div className="font-semibold text-ink mt-0.5">{s.level}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-ink-soft">Students</div>
                    <div className="font-semibold text-ink mt-0.5">{s.students}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-ink-soft">Student-Teacher</div>
                    <div className="font-semibold text-ink mt-0.5">{s.ratio}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-line flex items-center justify-between">
                <span className="text-xs text-ink-soft font-inter">Homes in Boundary: <strong className="text-ink">12 Active Listings</strong></span>
                <Link href={`/listings?city=${encodeURIComponent(s.city)}`}>
                  <Button variant="outline" size="sm">View Homes in District →</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
