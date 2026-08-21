import React from "react";

export interface HouseSVGPlaceholderProps {
  hue?: string; // CSS color string or Tailwind variable for background tint, e.g., "var(--sage-soft)", "#E4E9E2", etc.
  className?: string;
}

export const HouseSVGPlaceholder: React.FC<HouseSVGPlaceholderProps> = ({
  hue = "var(--sage-soft)",
  className = "",
}) => {
  return (
    <div
      style={{ backgroundColor: hue }}
      className={`w-full h-full flex items-center justify-center relative select-none overflow-hidden rounded-xl border border-line/50 transition-colors duration-300 ${className}`}
    >
      {/* Blueprint grid background lines for architectural theme */}
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

      {/* House Silhouette Line-Art */}
      <svg
        className="w-1/3 h-1/3 text-ink opacity-80"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Ground Line */}
        <line x1="10" y1="85" x2="90" y2="85" strokeWidth="2" />
        
        {/* House Main Body */}
        <rect x="25" y="45" width="50" height="40" />
        
        {/* Roof */}
        <polyline points="20,45 50,15 80,45" />
        
        {/* Door */}
        <rect x="44" y="60" width="12" height="25" />
        <circle cx="52" cy="72" r="1" fill="currentColor" />
        
        {/* Windows */}
        <rect x="32" y="52" width="8" height="8" />
        <line x1="36" y1="52" x2="36" y2="60" />
        <line x1="32" y1="56" x2="40" y2="56" />

        <rect x="60" y="52" width="8" height="8" />
        <line x1="64" y1="52" x2="64" y2="60" />
        <line x1="60" y1="56" x2="68" y2="56" />

        {/* Chimney */}
        <polyline points="65,30 65,22 72,22 72,37" />
      </svg>
    </div>
  );
};

export default HouseSVGPlaceholder;
