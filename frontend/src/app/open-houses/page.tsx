"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { StaggerGrid, StaggerItem } from "@/components/StaggerGrid";
import { MagneticButton } from "@/components/MagneticButton";
import { ImageCurtainReveal } from "@/components/motion/ImageCurtainReveal";
import { TextMaskReveal } from "@/components/motion/TextMaskReveal";
import { getApiUrl, getImageUrl } from "@/lib/config";
import { DEFAULT_ESTATE_IMAGES } from "@/components/HouseSVGPlaceholder";

interface OpenHouseItem {
  id: number;
  listing_id: number;
  address: string;
  city: string;
  price: number;
  price_formatted: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  open_house_time: string;
  agent_name: string;
  agent_role: string;
  image_url: string;
}

export default function OpenHousesPage() {
  const [openHouses, setOpenHouses] = useState<OpenHouseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayFilter, setDayFilter] = useState("all");
  
  // RSVP Modal State
  const [selectedHouse, setSelectedHouse] = useState<OpenHouseItem | null>(null);
  const [rsvpName, setRsvpName] = useState("");
  const [rsvpEmail, setRsvpEmail] = useState("");
  const [rsvpPhone, setRsvpPhone] = useState("");
  const [rsvpAttendees, setRsvpAttendees] = useState("1");
  const [rsvpSubmitting, setRsvpSubmitting] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpenHouses = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/open-houses`);
        if (res.ok) {
          const data: OpenHouseItem[] = await res.json();
          setOpenHouses(data || []);
        }
      } catch (err) {
        console.error("Failed to load open houses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOpenHouses();
  }, []);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHouse) return;

    setRsvpSubmitting(true);
    setRsvpError(null);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/open-houses/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: selectedHouse.listing_id,
          name: rsvpName,
          email: rsvpEmail,
          phone: rsvpPhone || null,
          attendees: parseInt(rsvpAttendees) || 1,
          preferred_time: selectedHouse.open_house_time,
        }),
      });

      if (res.ok) {
        setRsvpSuccess(true);
      } else {
        const err = await res.json();
        setRsvpError(err.detail || "Unable to confirm RSVP.");
      }
    } catch (err) {
      console.error(err);
      setRsvpError("Network error. Please try again.");
    } finally {
      setRsvpSubmitting(false);
    }
  };

  const filteredHouses = openHouses.filter((h) => {
    if (dayFilter === "sat") return h.open_house_time.toLowerCase().includes("saturday");
    if (dayFilter === "sun") return h.open_house_time.toLowerCase().includes("sunday");
    return true;
  });

  return (
    <div className="min-h-screen bg-bg text-ink font-inter">
      <main className="estateline-container py-12 space-y-12">
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 text-white rounded-2xl p-8 md:p-12 shadow-lg space-y-6">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-blue-500/30 text-blue-200 text-xs font-medium rounded-full border border-blue-400/30 mb-2">
              🗓️ Verified Agent Walkthroughs
            </span>
            <TextMaskReveal>
              <h1 className="font-fraunces text-3xl md:text-5xl font-bold text-white mt-1 tracking-tight">
                <span className="text-mask-inner inline-block">Upcoming Weekend</span>{" "}
                <span className="text-mask-inner inline-block">Open Houses<span className="text-brass">.</span></span>
              </h1>
            </TextMaskReveal>
            <p className="text-sm text-blue-200 mt-3 leading-relaxed">
              Explore scheduled open houses in Katy, Memorial, and Houston Heights this weekend. Walk through luxury properties hosted by certified licensed agents.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {[
              { id: "all", label: "All Weekend Schedules" },
              { id: "sat", label: "Saturday Walkthroughs" },
              { id: "sun", label: "Sunday Walkthroughs" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setDayFilter(f.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  dayFilter === f.id ? "bg-white text-blue-950 shadow-md font-bold" : "bg-blue-900/60 text-white border border-blue-700 hover:bg-blue-800"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-ink-soft">
            <div className="inline-block w-8 h-8 border-2 border-brass border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-xs">Loading weekend open house schedules...</p>
          </div>
        ) : filteredHouses.length === 0 ? (
          <div className="py-16 text-center text-ink-soft bg-surface border border-line rounded-2xl">
            <p className="text-sm font-medium">No open houses found for the selected filter.</p>
            <button onClick={() => setDayFilter("all")} className="mt-3 text-xs text-brass font-bold hover:underline cursor-pointer">
              View All Schedules →
            </button>
          </div>
        ) : (
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredHouses.map((item) => (
              <StaggerItem key={item.id}>
                <Card className="bg-surface p-0 rounded-2xl overflow-hidden border border-line flex flex-col justify-between hover:shadow-xl transition-shadow h-full">
                  <div>
                    <ImageCurtainReveal direction="up" className="h-48 w-full relative">
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.address}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_ESTATE_IMAGES[item.id % DEFAULT_ESTATE_IMAGES.length];
                        }}
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="brass">Open House</Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-black/75 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-xs">
                        ⏰ {item.open_house_time}
                      </div>
                    </ImageCurtainReveal>

                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-center text-xs text-ink-soft">
                        <span className="font-medium">{item.city}</span>
                        <span className="font-bold text-brass font-fraunces text-base">{item.price_formatted}</span>
                      </div>

                      <h3 className="font-fraunces text-lg font-bold text-ink truncate">{item.address}</h3>
                      <p className="text-xs text-ink-soft">
                        Hosted by Agent: <strong className="text-ink">{item.agent_name}</strong>
                      </p>
                      <div className="text-[11px] text-ink-soft/80">
                        {item.beds ? `${item.beds} Beds · ` : ""}{item.baths ? `${item.baths} Baths · ` : ""}{item.sqft ? `${item.sqft.toLocaleString()} Sq Ft` : ""}
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0 space-y-2">
                    <MagneticButton className="w-full">
                      <button
                        onClick={() => {
                          setSelectedHouse(item);
                          setRsvpSuccess(false);
                          setRsvpError(null);
                        }}
                        className="w-full py-2.5 bg-brass hover:bg-brass-deep text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        RSVP for Open House Walkthrough →
                      </button>
                    </MagneticButton>
                    <Link href={`/listings/${item.listing_id}`}>
                      <button className="w-full py-2 bg-bg hover:bg-line/40 text-ink font-medium text-xs rounded-lg transition-colors cursor-pointer border border-line">
                        View Full Property Details
                      </button>
                    </Link>
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}

        {/* RSVP Confirmation / Registration Modal */}
        <AnimatePresence>
          {selectedHouse && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedHouse(null)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-surface p-8 rounded-2xl max-w-md w-full border border-line space-y-5 shadow-2xl relative z-10"
              >
                {rsvpSuccess ? (
                  <div className="text-center space-y-4">
                    <div className="text-3xl">🎉</div>
                    <h3 className="font-fraunces text-2xl font-bold text-ink">RSVP Confirmed!</h3>
                    <p className="text-xs text-ink-soft leading-relaxed">
                      You are registered for the open house walkthrough at <strong className="text-ink">{selectedHouse.address}</strong> for <span className="text-brass font-bold">{selectedHouse.open_house_time}</span>. A confirmation has been sent to <strong>{rsvpEmail}</strong>.
                    </p>
                    <button
                      onClick={() => setSelectedHouse(null)}
                      className="w-full py-2.5 bg-ink text-white font-medium text-xs rounded-lg cursor-pointer hover:bg-ink/90 transition-colors"
                    >
                      Done & Return to Schedule
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRsvpSubmit} className="space-y-4">
                    <div>
                      <span className="text-xs text-brass font-semibold uppercase tracking-wider">RSVP Walkthrough</span>
                      <h3 className="font-fraunces text-xl font-bold text-ink">{selectedHouse.address}</h3>
                      <p className="text-xs text-ink-soft mt-1">Time: {selectedHouse.open_house_time}</p>
                    </div>

                    {rsvpError && (
                      <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                        {rsvpError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Your Name</label>
                      <input
                        type="text"
                        required
                        value={rsvpName}
                        onChange={(e) => setRsvpName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-ink-soft mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={rsvpEmail}
                        onChange={(e) => setRsvpEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="w-full px-3.5 py-2 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-ink-soft mb-1">Phone (Optional)</label>
                        <input
                          type="tel"
                          value={rsvpPhone}
                          onChange={(e) => setRsvpPhone(e.target.value)}
                          placeholder="(713) 555-0100"
                          className="w-full px-3.5 py-2 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-ink-soft mb-1">Guests / Attendees</label>
                        <select
                          value={rsvpAttendees}
                          onChange={(e) => setRsvpAttendees(e.target.value)}
                          className="w-full px-3.5 py-2 bg-bg border border-line rounded-lg text-xs font-inter focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                        >
                          <option value="1">1 Person</option>
                          <option value="2">2 People</option>
                          <option value="3">3 People</option>
                          <option value="4">4+ People</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSelectedHouse(null)}
                        className="flex-1 py-2.5 bg-bg text-ink text-xs font-medium rounded-lg border border-line hover:bg-line/30 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={rsvpSubmitting}
                        className="flex-1 py-2.5 bg-brass text-white text-xs font-medium rounded-lg hover:bg-brass-deep transition-colors shadow-xs disabled:opacity-50"
                      >
                        {rsvpSubmitting ? "Confirming..." : "Confirm RSVP →"}
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
