"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { getApiUrl } from "@/lib/config";

interface SchoolItem {
  name: string;
  district: string;
  rating: string;
  level: string;
  students: string;
  ratio: string;
  city: string;
  address: string;
  nearbyListingsCount: number;
}

export default function SchoolsPage() {
  const [district, setDistrict] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const params = new URLSearchParams();
        if (district !== "all") params.append("district", district);
        if (levelFilter !== "all") params.append("level", levelFilter);

        const res = await fetch(`${apiUrl}/schools?${params.toString()}`);
        if (res.ok) {
          const data: SchoolItem[] = await res.json();
          setSchools(data);
        }
      } catch (err) {
        console.error("Failed to load schools", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, [district, levelFilter]);

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
                    district === d.id ? "bg-brass text-white shadow-xs font-bold" : "bg-surface text-ink border border-line hover:border-ink"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-soft">Grade Level:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-1.5 bg-surface border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="Elementary">Elementary</option>
                <option value="Middle">Middle School</option>
                <option value="High">High School</option>
              </select>
            </div>
          </div>
        </div>

        {/* Schools List Cards */}
        {loading ? (
          <div className="py-20 text-center text-ink-soft">
            <div className="inline-block w-8 h-8 border-2 border-brass border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs">Fetching school ratings and nearby homes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schools.map((s, idx) => (
              <Card key={idx} className="bg-surface p-6 rounded-2xl border border-line space-y-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brass">
                      {s.district} · {s.level} School
                    </span>
                    <h3 className="font-fraunces text-xl font-bold text-ink mt-1">{s.name}</h3>
                    <p className="text-xs text-ink-soft mt-0.5">{s.address}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shrink-0">
                    <span className="font-fraunces font-bold text-lg leading-none">{s.rating}</span>
                    <span className="text-[9px] font-medium uppercase tracking-tight mt-0.5">Rating</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-line text-center text-xs">
                  <div>
                    <span className="text-ink-soft text-[11px] block">Students</span>
                    <span className="font-semibold text-ink">{s.students}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft text-[11px] block">Student/Teacher</span>
                    <span className="font-semibold text-ink">{s.ratio}</span>
                  </div>
                  <div>
                    <span className="text-ink-soft text-[11px] block">Available Homes</span>
                    <span className="font-semibold text-brass font-bold">{s.nearbyListingsCount} in {s.city}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs text-ink-soft">
                    Serving <strong className="text-ink">{s.city}</strong> attendance zone
                  </span>
                  <Link href={`/listings?city=${encodeURIComponent(s.city)}`}>
                    <Button variant="outline" size="sm">
                      View {s.nearbyListingsCount} Nearby Homes →
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
