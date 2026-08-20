"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";

export default function OpenHousesPage() {
  const [dayFilter, setDayFilter] = useState("all");
  const [rsvpModal, setRsvpModal] = useState<string | null>(null);

  const openHouses = [
    {
      id: 1,
      address: "1204 Oak Ridge Lane",
      city: "Katy",
      price: "$540,000",
      time: "Saturday, 10:00 AM – 2:00 PM",
      agent: "Rhea Malhotra",
      image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 7,
      address: "802 Memorial Drive #404",
      city: "Memorial",
      price: "$3,800/mo",
      time: "Sunday, 1:00 PM – 4:00 PM",
      agent: "Sarah Jenkins",
      image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: 19,
      address: "1600 Post Oak Blvd Penthouse 38",
      city: "Memorial",
      price: "$2,850,000",
      time: "Sunday, 2:00 PM – 5:00 PM",
      agent: "David Chen",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <Header />

      <main className="estateline-container py-12 space-y-12">
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 text-white rounded-[20px] p-8 md:p-12 shadow-lg space-y-6">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-blue-500/30 text-blue-200 text-xs font-mono uppercase rounded-full border border-blue-400/30 mb-2">
              🗓️ Verified Agent Walkthroughs
            </span>
            <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-white mt-1 tracking-tight">
              Upcoming Weekend Open Houses<span className="text-brass">.</span>
            </h1>
            <p className="text-sm text-blue-200 mt-3 leading-relaxed">
              Explore scheduled open houses in Katy, Memorial, and Houston Heights this weekend. Walk through luxury properties hosted by certified licensed agents.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { id: "all", label: "All Weekend Schedules" },
              { id: "sat", label: "This Saturday (10am - 4pm)" },
              { id: "sun", label: "This Sunday (12pm - 5pm)" },
              { id: "virtual", label: "Virtual 3D Tours" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDayFilter(f.id)}
                className={`px-4 py-2 rounded-full text-xs font-inter font-bold transition-all cursor-pointer ${
                  dayFilter === f.id ? "bg-white text-blue-950 shadow-md" : "bg-blue-900/60 text-white border border-blue-700 hover:bg-blue-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {openHouses.map((item) => (
            <Card key={item.id} className="bg-surface p-0 rounded-[16px] overflow-hidden border border-line flex flex-col justify-between hover:shadow-xl transition-shadow">
              <div>
                <div className="h-48 w-full relative overflow-hidden">
                  <img src={item.image} alt={item.address} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3">
                    <Badge variant="brass">OPEN HOUSE</Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/75 text-white text-[11px] font-mono px-2.5 py-1 rounded-[4px] backdrop-blur-xs">
                    ⏰ {item.time}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono uppercase text-ink-soft">
                    <span>{item.city}</span>
                    <span className="font-bold text-brass font-fraunces text-base">{item.price}</span>
                  </div>

                  <h3 className="font-fraunces text-lg font-bold text-ink truncate">{item.address}</h3>
                  <p className="text-xs text-ink-soft">Hosted by Agent: <strong className="text-ink">{item.agent}</strong></p>
                </div>
              </div>

              <div className="p-6 pt-0 space-y-2">
                <button
                  onClick={() => setRsvpModal(item.address)}
                  className="w-full py-2.5 bg-brass hover:bg-brass-deep text-white font-inter font-bold text-xs rounded-[8px] transition-colors cursor-pointer shadow-sm"
                >
                  RSVP for Open House Walkthrough →
                </button>
                <Link href={`/listings/${item.id}`}>
                  <button className="w-full py-2 bg-bg hover:bg-line/40 text-ink font-inter font-bold text-xs rounded-[8px] transition-colors cursor-pointer border border-line">
                    View Full Property Details
                  </button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* RSVP Confirmation Modal */}
        {rsvpModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface p-8 rounded-[20px] max-w-md w-full border border-line space-y-4 shadow-2xl">
              <h3 className="font-fraunces text-2xl font-bold text-ink">RSVP Confirmed!</h3>
              <p className="text-xs text-ink-soft leading-relaxed">
                You are registered for the open house walkthrough at <strong className="text-ink">{rsvpModal}</strong>. A calendar invite & entry QR code has been generated.
              </p>
              <button
                onClick={() => setRsvpModal(null)}
                className="w-full py-2.5 bg-ink text-white font-inter font-bold text-xs rounded-[8px] cursor-pointer"
              >
                Close & Return to Schedule
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
