"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export interface MapPin {
  id: number;
  label: string;
  top?: string;
  left?: string;
  title: string;
  beds?: string;
  baths?: string;
  sqft?: string;
  city: string;
  link: string;
}

export interface MapPlaceholderProps {
  address?: string;
  city?: string;
  className?: string;
  pins?: MapPin[];
}

export const MapPlaceholder: React.FC<MapPlaceholderProps> = ({
  address = "1204 Oak Ridge Lane",
  city = "Katy",
  className = "",
  pins,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activePin, setActivePin] = useState<number | null>(1);

  const defaultPins: MapPin[] = [
    { id: 1, label: "$540,000", top: "35%", left: "45%", title: address || "1204 Oak Ridge Lane", beds: "4 Beds", baths: "3.5 Baths", sqft: "3,200", city: city || "Katy", link: pathname || "/listings/1" },
    { id: 2, label: "$1,250,000", top: "25%", left: "68%", title: "802 Memorial Drive #404", beds: "5 Beds", baths: "4.5 Baths", sqft: "4,800", city: "Memorial", link: "/listings/7" },
    { id: 3, label: "$2,850,000", top: "60%", left: "30%", title: "1600 Post Oak Blvd Penthouse", beds: "3 Beds", baths: "3.5 Baths", sqft: "3,900", city: "Memorial", link: "/listings/19" },
    { id: 4, label: "$890,000", top: "70%", left: "75%", title: "4509 Heights Blvd", beds: "4 Beds", baths: "3.0 Baths", sqft: "3,100", city: "The Heights", link: "/listings/12" },
  ];

  const pricePins = pins && pins.length > 0 ? pins : defaultPins;
  const currentPin = pricePins.find((p) => p.id === activePin) || pricePins[0];

  const mapQuery = `${address}, ${city}, TX`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  const handleViewClick = () => {
    if (!currentPin) return;
    if (pathname === currentPin.link || currentPin.id === 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(currentPin.link);
    }
  };

  return (
    <div
      className={`w-full h-84 bg-[#E5E9EC] border border-line rounded-2xl relative overflow-hidden flex flex-col justify-between p-4 shadow-inner ${className}`}
    >
      {/* Real Live Map Embed Background */}
      <iframe
        title={`Map of ${mapQuery}`}
        className="absolute inset-0 w-full h-full border-0 opacity-85"
        loading="lazy"
        allowFullScreen
        src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
      />

      {/* Header Info Bar */}
      <div className="z-10 flex items-center justify-between">
        <span className="text-[11px] font-inter uppercase tracking-wider text-ink bg-surface/95 px-3 py-1.5 rounded-full border border-line/80 shadow-xs font-bold flex items-center gap-1.5">
          <span>📍</span>
          <span>Live Interactive Map · {city || "Texas"}</span>
        </span>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-mono text-brass hover:underline font-bold bg-surface/95 px-3 py-1.5 rounded-full border border-line/80 shadow-xs flex items-center gap-1 transition-all hover:bg-surface"
        >
          <span>Open in Maps</span>
          <span>↗</span>
        </a>
      </div>

      {/* Interactive Price Pins */}
      {pricePins.map((pin) => (
        <div
          key={pin.id}
          style={{ top: pin.top || "45%", left: pin.left || "50%" }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
        >
          <button
            type="button"
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
        <div className="z-20 self-center bg-surface border border-line rounded-xl p-3.5 shadow-xl max-w-sm w-full flex items-center justify-between gap-3 animate-fade-in backdrop-blur-xs">
          <div className="space-y-0.5 min-w-0">
            <span className="text-xs font-medium text-brass block">{currentPin.city} Sub-market</span>
            <h4 className="font-fraunces font-bold text-sm text-ink truncate">{currentPin.title}</h4>
            <p className="text-xs text-ink-soft">{currentPin.beds} · {currentPin.baths} · {currentPin.sqft}</p>
          </div>
          <button
            type="button"
            onClick={handleViewClick}
            className="px-4 py-2 bg-ink hover:bg-brass text-white text-xs font-medium rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shadow-xs hover:shadow-md active:scale-95 flex items-center gap-1"
          >
            <span>View</span>
            <span>→</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MapPlaceholder;
