"use client";

import React, { useState } from "react";
import Link from "next/link";

export interface MapPlaceholderProps {
  address?: string;
  city?: string;
  className?: string;
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  address = "1204 Oak Ridge Lane",
  city = "Katy",
  className = "",
}) => {
  const [activePin, setActivePin] = useState<number | null>(1);
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const pricePins = [
    { id: 1, label: "$540,000", top: "35%", left: "45%", title: "1204 Oak Ridge Lane", beds: "4 Beds", baths: "3.5 Baths", sqft: "3,200", city: "Katy", link: "/listings/1" },
    { id: 2, label: "$1,250,000", top: "25%", left: "68%", title: "802 Memorial Drive #404", beds: "5 Beds", baths: "4.5 Baths", sqft: "4,800", city: "Memorial", link: "/listings/7" },
    { id: 3, label: "$2,850,000", top: "60%", left: "30%", title: "1600 Post Oak Blvd Penthouse", beds: "3 Beds", baths: "3.5 Baths", sqft: "3,900", city: "Memorial", link: "/listings/19" },
    { id: 4, label: "$890,000", top: "70%", left: "75%", title: "4509 Heights Blvd", beds: "4 Beds", baths: "3.0 Baths", sqft: "3,100", city: "The Heights", link: "/listings/12" },
  ];

  const currentPin = pricePins.find((p) => p.id === activePin) || pricePins[0];

  return (
    <div
      className={`w-full h-80 bg-[#E5E9EC] border border-line rounded-[16px] relative overflow-hidden flex flex-col justify-between p-4 shadow-inner ${className}`}
    >
      {/* Real Google Maps Embed Background if API Key is Present */}
      {googleApiKey ? (
        <iframe
          className="absolute inset-0 w-full h-full border-0 pointer-events-none opacity-60"
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps/embed/v1/place?key=${googleApiKey}&q=${encodeURIComponent(
            `${address}, ${city}, TX`
          )}&zoom=13`}
        />
      ) : (
        /* Map vector grid background styling fallback */
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="map-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#94A3B8" strokeWidth="1" />
                <path d="M 0 30 L 60 30 M 30 0 L 30 60" fill="none" stroke="#CBD5E1" strokeWidth="0.5" strokeDasharray="3,3" />
                <circle cx="30" cy="30" r="1.5" fill="var(--brass)" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#map-grid)" />
          </svg>
        </div>
      )}

      {/* Header Info Bar */}
      <div className="z-10 flex items-center justify-between pointer-events-none">
        <span className="text-[10px] font-mono uppercase tracking-wider text-ink-soft bg-surface/90 px-3 py-1 rounded-full border border-line/60 shadow-xs font-bold">
          📍 {googleApiKey ? "Google Maps API Activated" : "Live Interactive Texas Price Pin Map"}
        </span>
        <span className="text-[10px] font-mono text-brass font-bold bg-surface/90 px-2.5 py-1 rounded-full border border-line/60">
          29.7858° N, 95.8245° W
        </span>
      </div>

      {/* Interactive Price Pins */}
      {pricePins.map((pin) => (
        <div
          key={pin.id}
          style={{ top: pin.top, left: pin.left }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <button
            onClick={() => setActivePin(pin.id)}
            className={`px-3 py-1.5 rounded-full font-fraunces font-bold text-xs shadow-lg transition-all duration-300 cursor-pointer border ${
              activePin === pin.id
                ? "bg-brass text-white border-white scale-110 ring-4 ring-brass/30"
                : "bg-ink text-white border-line hover:bg-brass hover:scale-105"
            }`}
          >
            {pin.label}
          </button>
        </div>
      ))}

      {/* Active Pin Property Preview Card */}
      {currentPin && (
        <div className="z-20 self-center bg-surface border border-line rounded-[14px] p-3 shadow-xl max-w-sm w-full flex items-center justify-between gap-3 animate-fade-in">
          <div className="space-y-0.5">
            <span className="text-[10px] font-mono uppercase text-brass font-bold">{currentPin.city} Sub-market</span>
            <h4 className="font-fraunces font-bold text-sm text-ink truncate">{currentPin.title}</h4>
            <p className="text-[11px] text-ink-soft">{currentPin.beds} · {currentPin.baths} · {currentPin.sqft} sqft</p>
          </div>
          <Link href={currentPin.link}>
            <button className="px-3.5 py-2 bg-ink hover:bg-brass text-white text-xs font-inter font-bold rounded-[8px] transition-colors cursor-pointer whitespace-nowrap">
              View →
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default MapPlaceholder;
