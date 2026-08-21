import React, { useState } from "react";

export interface HouseSVGPlaceholderProps {
  hue?: string;
  className?: string;
  index?: number;
  alt?: string;
}

const DEFAULT_ESTATE_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
];

export const HouseSVGPlaceholder: React.FC<HouseSVGPlaceholderProps> = ({
  hue = "var(--sage-soft)",
  className = "",
  index = 0,
  alt = "Luxury Architectural Residence",
}) => {
  const [imgError, setImgError] = useState(false);
  const fallbackUrl = DEFAULT_ESTATE_IMAGES[Math.abs(index) % DEFAULT_ESTATE_IMAGES.length];

  if (imgError) {
    return (
      <div
        style={{ backgroundColor: hue }}
        className={`w-full h-full flex items-center justify-center relative select-none overflow-hidden rounded-xl border border-line/50 ${className}`}
      >
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="none" />
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--ink)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        <svg
          className="w-1/3 h-1/3 text-ink opacity-80"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="10" y1="85" x2="90" y2="85" strokeWidth="2" />
          <rect x="25" y="45" width="50" height="40" />
          <polyline points="20,45 50,15 80,45" />
          <rect x="44" y="60" width="12" height="25" />
          <circle cx="52" cy="72" r="1" fill="currentColor" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`w-full h-full overflow-hidden relative bg-bg ${className}`}>
      <img
        src={fallbackUrl}
        alt={alt}
        onError={() => setImgError(true)}
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    </div>
  );
};

export default HouseSVGPlaceholder;
