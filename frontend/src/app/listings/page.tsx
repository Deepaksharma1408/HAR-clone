"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { HouseSVGPlaceholder } from "@/components/HouseSVGPlaceholder";
import { useFavorites } from "@/context/FavoritesContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ListingItem {
  id: number;
  address: string;
  city: string;
  price: number;
  type: string;
  status: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  hue_color: string | null;
  images?: { id: number; image_url: string; order: number }[];
}

const harToolShortcuts = [
  {
    label: "Open House",
    tag: "open_house",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    bg: "bg-blue-600",
    link: "/open-houses",
  },
  {
    label: "Just Listed",
    sort: "newest",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    bg: "bg-emerald-600",
    link: "/listings?sort=newest",
  },
  {
    label: "New Homes",
    tag: "new_construction",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4" />
      </svg>
    ),
    bg: "bg-pink-600",
    link: "/listings?tag=new_construction",
  },
  {
    label: "Recent Price Changes",
    tag: "price_reduced",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    ),
    bg: "bg-purple-600",
    link: "/listings?tag=price_reduced",
  },
  {
    label: "Apartment Search",
    tag: "apartment",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4" />
      </svg>
    ),
    bg: "bg-amber-600",
    link: "/listings?tag=apartment",
  },
  {
    label: "Rental Properties",
    type: "For Rent",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
    bg: "bg-indigo-600",
    link: "/listings?type=For+Rent",
  },
  {
    label: "Commercial Properties",
    type: "Commercial",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M3 10h18M3 7l9-4 9 4M8 14v3m4-3v3m4-3v3" />
      </svg>
    ),
    bg: "bg-rose-600",
    link: "/listings?type=Commercial",
  },
  {
    label: "Global Properties",
    tag: "global",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8" />
      </svg>
    ),
    bg: "bg-teal-600",
    link: "/listings?tag=global",
  },
  {
    label: "Luxury Homes",
    type: "Luxury Villa",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    bg: "bg-yellow-600",
    link: "/listings?type=Luxury+Villa",
  },
  {
    label: "Land & Acreage",
    type: "Farmhouse",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v16h14V3H5zm0 16l4-4 4 4 4-4 2 2" />
      </svg>
    ),
    bg: "bg-emerald-700",
    link: "/listings?type=Farmhouse",
  },
  {
    label: "Foreclosed Homes",
    tag: "foreclosure",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    bg: "bg-slate-700",
    link: "/listings?tag=foreclosure",
  },
  {
    label: "Track Home Value",
    tag: "valuation",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m2 0h2a2 2 0 002-2v-5a2 2 0 00-.586-1.414l-7-7a2 2 0 00-2.828 0l-7 7A2 2 0 003 12v5a2 2 0 002 2h2" />
      </svg>
    ),
    bg: "bg-rose-700",
    link: "/home-value",
  },
  {
    label: "Explore Neighborhoods",
    city: "Memorial",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bg: "bg-amber-700",
    link: "/neighborhoods",
  },
  {
    label: "School Finder",
    city: "Katy",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
      </svg>
    ),
    bg: "bg-lime-600",
    link: "/schools",
  },
  {
    label: "Drive Time",
    city: "The Heights",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
    bg: "bg-cyan-600",
    link: "/drive-time",
  },
  {
    label: "High-Rise Finder",
    type: "Penthouse",
    svg: (
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4" />
      </svg>
    ),
    bg: "bg-sky-600",
    link: "/listings?type=Penthouse",
  },
];

function ListingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isFavorite, toggleFavorite } = useFavorites();

  // Filter States
  const [cityInput, setCityInput] = useState(searchParams.get("city") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
  const [tagInput, setTagInput] = useState(searchParams.get("tag") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [minBeds, setMinBeds] = useState(searchParams.get("min_beds") || "");
  const [schoolDistrict, setSchoolDistrict] = useState("all");
  const [sortOption, setSortOption] = useState(searchParams.get("sort") || "newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Quick Tools Carousel Scroll State
  const shortcutRef = React.useRef<HTMLDivElement>(null);
  const scrollShortcuts = (direction: "left" | "right") => {
    if (shortcutRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      shortcutRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Sync state with URL searchParams when navigation occurs
  useEffect(() => {
    setCityInput(searchParams.get("city") || "");
    setSelectedType(searchParams.get("type") || "");
    setTagInput(searchParams.get("tag") || "");
    if (searchParams.get("sort")) setSortOption(searchParams.get("sort") || "newest");
  }, [searchParams]);

  // Visual-only amenity chips state
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(["Pool"]);

  // Results & Pagination state
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append("type", selectedType);
      if (tagInput) params.append("tag", tagInput);
      if (cityInput) params.append("city", cityInput);
      if (maxPrice) params.append("max_price", maxPrice);
      if (minBeds) params.append("min_beds", minBeds);
      if (sortOption) params.append("sort", sortOption);
      params.append("page", page.toString());
      params.append("page_size", "9");

      const res = await fetch(`${API_URL}/listings?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setListings(data.results || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedType, tagInput, cityInput, maxPrice, minBeds, sortOption, page]);

  const handleCitySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const toggleAmenity = (name: string) => {
    if (selectedAmenities.includes(name)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== name));
    } else {
      setSelectedAmenities([...selectedAmenities, name]);
    }
  };

  const formatPrice = (price: number, type: string) => {
    if (type === "For Rent") {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="estateline-container py-10">
      {/* 1. Feature Carousel Shortcut Toolbar on Listings Page */}
      <div className="mb-8 border-b border-line pb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-ink-soft">
            Explore Estateline Quick Tools & Feature Portfolios
          </span>
          <span className="text-xs font-inter font-bold text-brass">16 Features Active</span>
        </div>

        <div className="relative group">
          {/* Left Scroll Button */}
          <button
            onClick={() => scrollShortcuts("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-surface border border-line text-ink flex items-center justify-center shadow-md hover:bg-brass hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll Left"
          >
            ‹
          </button>

          {/* Track */}
          <div
            ref={shortcutRef}
            className="flex items-center gap-3 overflow-x-auto scrollbar-none py-1.5 px-4 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {harToolShortcuts.map((tool, idx) => {
              const isActive =
                (tool.tag && tool.tag === tagInput) ||
                (tool.type && tool.type === selectedType) ||
                (tool.city && tool.city === cityInput) ||
                (tool.sort && sortOption === "newest" && !tagInput && !selectedType && !cityInput);

              return (
                <Link
                  key={idx}
                  href={tool.link}
                  className={`flex-shrink-0 px-4 py-2 rounded-full border text-xs font-inter font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? "bg-ink text-white border-ink shadow-md"
                      : "bg-surface text-ink border-line hover:border-brass hover:bg-bg"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full ${tool.bg} text-white flex items-center justify-center text-[10px]`}>
                    {tool.svg}
                  </span>
                  <span>{tool.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scrollShortcuts("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-surface border border-line text-ink flex items-center justify-center shadow-md hover:bg-brass hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll Right"
          >
            ›
          </button>
        </div>
      </div>

      {/* 2. Feature-Specific Rich Banner Dashboards */}
      {tagInput === "open_house" && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-[16px] shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-500/30 text-blue-200 text-xs font-mono uppercase rounded-full mb-2 border border-blue-400/30">
                🗓️ Texas Open House Schedule
              </span>
              <h2 className="font-fraunces text-2xl font-bold text-white mb-1">
                Upcoming Agent-Hosted Weekend Open Houses
              </h2>
              <p className="text-xs text-blue-200 leading-relaxed">
                Filter verified agent walkthroughs in Houston, Katy, and Memorial scheduled for this weekend.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="px-3.5 py-2 bg-white text-blue-950 font-inter font-bold text-xs rounded-full hover:bg-blue-50 transition-colors shadow-sm">
                This Saturday (10am - 4pm)
              </button>
              <button className="px-3.5 py-2 bg-blue-800 text-white font-inter font-bold text-xs rounded-full hover:bg-blue-700 transition-colors">
                This Sunday (12pm - 5pm)
              </button>
              <button className="px-3.5 py-2 bg-blue-800 text-white font-inter font-bold text-xs rounded-full hover:bg-blue-700 transition-colors">
                Virtual 3D Tours
              </button>
            </div>
          </div>
        </div>
      )}

      {tagInput === "valuation" && (
        <div className="mb-8 p-6 bg-surface border-2 border-brass/40 rounded-[16px] shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-inter font-bold rounded-full mb-2">
                📊 Instant Home Valuation Tool (AVM Calculator)
              </span>
              <h2 className="font-fraunces text-2xl font-bold text-ink mb-1">
                What is your Texas Home Worth Today?
              </h2>
              <p className="text-xs text-ink-soft mb-4">
                Automated valuation model estimating market value range, $/sqft trends, and comparative sales.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Enter property address (e.g. 1204 Oak Ridge Lane)..."
                  className="flex-1 px-4 py-2 bg-bg border border-line rounded-[8px] text-xs font-inter focus:outline-none focus:border-brass"
                  defaultValue="1204 Oak Ridge Lane, Katy TX"
                />
                <button className="px-5 py-2 bg-brass text-white font-inter font-bold text-xs rounded-[8px] hover:bg-brass-dark transition-colors">
                  Calculate Value
                </button>
              </div>
            </div>
            <div className="bg-bg border border-line p-4 rounded-[12px] text-center space-y-2">
              <span className="text-[10px] font-mono uppercase text-ink-soft">Estimated Market Value</span>
              <div className="font-fraunces text-3xl font-bold text-brass">$540,000</div>
              <div className="text-[11px] font-inter text-emerald-600 font-bold">+6.8% Appreciated (1-Yr)</div>
              <div className="text-[10px] text-ink-soft">Est. Range: $515,000 – $565,000</div>
            </div>
          </div>
        </div>
      )}

      {(cityInput === "Katy" || cityInput === "Memorial" || cityInput === "The Heights") && (
        <div className="mb-8 p-6 bg-surface border border-line rounded-[16px] shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 border-b border-line/60 pb-4">
            <div>
              <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-900 text-xs font-inter font-bold rounded-full mb-1">
                📍 Neighborhood & School Intelligence
              </span>
              <h2 className="font-fraunces text-2xl font-bold text-ink">
                {cityInput} District Guide & School Stats
              </h2>
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              {["Memorial", "Katy", "The Heights", "Sugar Land"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCityInput(c)}
                  className={`px-3 py-1 text-xs font-inter font-bold rounded-full transition-colors ${
                    cityInput === c ? "bg-brass text-white" : "bg-bg text-ink hover:bg-line/40"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-bg p-3 rounded-[8px] text-center border border-line">
              <div className="text-[10px] font-mono uppercase text-ink-soft">Safety Rating</div>
              <div className="font-inter font-bold text-lg text-emerald-600">96 / 100</div>
              <div className="text-[10px] text-ink-soft">Top Tier Safety</div>
            </div>
            <div className="bg-bg p-3 rounded-[8px] text-center border border-line">
              <div className="text-[10px] font-mono uppercase text-ink-soft">School Score</div>
              <div className="font-inter font-bold text-lg text-blue-600">10 / 10</div>
              <div className="text-[10px] text-ink-soft">GreatSchools Certified</div>
            </div>
            <div className="bg-bg p-3 rounded-[8px] text-center border border-line">
              <div className="text-[10px] font-mono uppercase text-ink-soft">Walk Score</div>
              <div className="font-inter font-bold text-lg text-amber-600">88 / 100</div>
              <div className="text-[10px] text-ink-soft">Very Walkable</div>
            </div>
            <div className="bg-bg p-3 rounded-[8px] text-center border border-line">
              <div className="text-[10px] font-mono uppercase text-ink-soft">Avg Commute</div>
              <div className="font-inter font-bold text-lg text-ink">22 Mins</div>
              <div className="text-[10px] text-ink-soft">To Downtown HQ</div>
            </div>
          </div>
        </div>
      )}

      {tagInput === "new_construction" && (
        <div className="mb-8 p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 text-white rounded-[16px] shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-500/30 text-emerald-200 text-xs font-mono uppercase rounded-full mb-2 border border-emerald-400/30">
                🏗️ 2026 Master Planned Builders
              </span>
              <h2 className="font-fraunces text-2xl font-bold text-white mb-1">
                New Construction & Newly Built Estates
              </h2>
              <p className="text-xs text-emerald-200">
                Explore brand new homes backed by 10-Year Structural Builder Warranties and EnergyStar certifications.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 bg-emerald-800/80 text-white font-inter font-bold text-xs rounded-full">
                Toll Brothers
              </span>
              <span className="px-3.5 py-1.5 bg-emerald-800/80 text-white font-inter font-bold text-xs rounded-full">
                Perry Homes
              </span>
              <span className="px-3.5 py-1.5 bg-white text-emerald-950 font-inter font-bold text-xs rounded-full">
                Move-In Ready
              </span>
            </div>
          </div>
        </div>
      )}

      {tagInput === "price_reduced" && (
        <div className="mb-8 p-6 bg-gradient-to-r from-purple-950 via-indigo-900 to-purple-900 text-white rounded-[16px] shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-purple-500/30 text-purple-200 text-xs font-mono uppercase rounded-full mb-2 border border-purple-400/30">
                🔥 Price Reduction & Bargain Alerts
              </span>
              <h2 className="font-fraunces text-2xl font-bold text-white mb-1">
                Recent Price Drops in Texas
              </h2>
              <p className="text-xs text-purple-200">
                Properties with verified recent price cuts. Average savings: -$28,500 (-5.4%).
              </p>
            </div>
            <button className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-inter font-bold text-xs rounded-full transition-colors shadow-md">
              🔔 Enable Price Cut SMS Alerts
            </button>
          </div>
        </div>
      )}

      {tagInput === "foreclosure" && (
        <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 via-gray-900 to-slate-950 text-white rounded-[16px] shadow-lg border border-slate-700">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-slate-700 text-slate-200 text-xs font-mono uppercase rounded-full mb-2">
                ⚡ Pre-Foreclosure & REO Bank Owned Hub
              </span>
              <h2 className="font-fraunces text-2xl font-bold text-white mb-1">
                Foreclosed Homes & Bank Assets (-18% Below Assessment)
              </h2>
              <p className="text-xs text-slate-300">
                Exclusive bank REO inventory and foreclosed properties available for immediate purchase.
              </p>
            </div>
            <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-inter font-bold text-xs rounded-full transition-colors shadow-md">
              Contact Asset Manager
            </button>
          </div>
        </div>
      )}

      {tagInput === "global" && (
        <div className="mb-8 p-6 bg-gradient-to-r from-teal-950 via-cyan-900 to-teal-900 text-white rounded-[16px] shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-teal-500/30 text-teal-200 text-xs font-mono uppercase rounded-full mb-2 border border-teal-400/30">
                🌐 Global Ultra-Luxury Estates ($4M+)
              </span>
              <h2 className="font-fraunces text-2xl font-bold text-white mb-1">
                International & Cross-Border Real Estate Desk
              </h2>
              <p className="text-xs text-teal-200">
                Curated portfolio for international buyers, multi-currency support, and private concierge relocation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-teal-800 text-xs font-mono rounded">USD ($)</span>
              <span className="px-3 py-1 bg-teal-800 text-xs font-mono rounded">EUR (€)</span>
              <span className="px-3 py-1 bg-teal-800 text-xs font-mono rounded">GBP (£)</span>
            </div>
          </div>
        </div>
      )}

      {selectedType === "Penthouse" && (
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 text-white rounded-[16px] shadow-lg">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-amber-500/30 text-amber-200 text-xs font-mono uppercase rounded-full mb-2 border border-amber-400/30">
                🏙️ Texas Sky Condos & High-Rise Towers
              </span>
              <h2 className="font-fraunces text-2xl font-bold text-white mb-1">
                Skyline Penthouses & Tower Residences
              </h2>
              <p className="text-xs text-amber-200">
                Featuring floor-to-ceiling glass walls, 24/7 concierge, rooftop infinity pools, and valet parking.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-900/60 text-amber-200 text-xs font-inter rounded-full border border-amber-500/30">
                Level 15+ Skyline Views
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8 border-b border-line pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <EyebrowLabel>Architectural Portfolio</EyebrowLabel>
          <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
            {tagInput === "open_house"
              ? "Open House Schedule"
              : tagInput === "new_construction"
              ? "New Construction Homes"
              : tagInput === "price_reduced"
              ? "Recent Price Changes"
              : tagInput === "apartment"
              ? "Apartment & Loft Rentals"
              : tagInput === "global"
              ? "Global Ultra-Luxury Estates ($4M+)"
              : tagInput === "foreclosure"
              ? "Foreclosed & Value Deals"
              : tagInput === "valuation"
              ? "Property Valuation Portfolio"
              : selectedType
              ? `${selectedType} Portfolio`
              : cityInput
              ? `${cityInput} Properties`
              : "Search Properties"}
            <span className="text-brass">.</span>
          </h1>
        </div>

        {/* View mode & Sort dropdown */}
        <div className="flex items-center gap-4">
          <div className="flex border border-line rounded-[2px] overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 text-xs font-mono uppercase transition-colors ${
                viewMode === "grid" ? "bg-brass text-white" : "bg-surface text-ink hover:bg-bg"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 text-xs font-mono uppercase transition-colors ${
                viewMode === "list" ? "bg-brass text-white" : "bg-surface text-ink hover:bg-bg"
              }`}
            >
              List
            </button>
          </div>

          <div className="w-48">
            <Select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "newest", label: "Sort: Newest" },
                { value: "price_asc", label: "Price: Low to High" },
                { value: "price_desc", label: "Price: High to Low" },
                { value: "beds", label: "Most Bedrooms" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <Card hoverable={false} className="space-y-5 bg-surface">
            <h3 className="font-fraunces text-lg font-medium text-ink border-b border-line pb-2">
              Filter Portfolio
            </h3>

            {/* City Search */}
            <form onSubmit={handleCitySearchSubmit}>
              <Input
                label="City / Location"
                placeholder="Search Katy, Memorial..."
                value={cityInput}
                onChange={(e) => setCityInput(e.target.value)}
              />
            </form>

            {/* Property Type Chips */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-soft mb-2">
                Property Type
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: "", label: "All" },
                  { id: "For Sale", label: "For Sale" },
                  { id: "For Rent", label: "For Rent" },
                  { id: "Luxury Villa", label: "Villa" },
                  { id: "Penthouse", label: "Penthouse" },
                  { id: "Farmhouse", label: "Farmhouse" },
                  { id: "Commercial", label: "Commercial" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedType(t.id);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 text-[10px] font-mono uppercase rounded-[2px] border transition-all ${
                      selectedType === t.id
                        ? "bg-brass text-white border-brass"
                        : "bg-bg text-ink border-line hover:border-ink"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <Select
              label="Maximum Price"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "No Limit" },
                { value: "500000", label: "Under $500,000" },
                { value: "1000000", label: "Under $1,000,000" },
                { value: "3000000", label: "Under $3,000,000" },
                { value: "5000000", label: "Under $5,000,000" },
              ]}
            />

            {/* Bedrooms Filter */}
            <Select
              label="Minimum Bedrooms"
              value={minBeds}
              onChange={(e) => {
                setMinBeds(e.target.value);
                setPage(1);
              }}
              options={[
                { value: "", label: "Any Bedrooms" },
                { value: "1", label: "1+ Bedrooms" },
                { value: "2", label: "2+ Bedrooms" },
                { value: "3", label: "3+ Bedrooms" },
                { value: "4", label: "4+ Bedrooms" },
                { value: "5", label: "5+ Bedrooms" },
              ]}
            />

            {/* School District Dropdown (Static UI) */}
            <Select
              label="School District (Static)"
              value={schoolDistrict}
              onChange={(e) => setSchoolDistrict(e.target.value)}
              options={[
                { value: "all", label: "All Districts" },
                { value: "katy", label: "Katy ISD" },
                { value: "memorial", label: "Spring Branch ISD" },
                { value: "houston", label: "Houston ISD" },
              ]}
            />

            {/* Amenities Chips (Visual Only) */}
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-wider text-ink-soft mb-2">
                Amenities (Visual)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["Pool", "Garage", "Waterfront", "Gated", "Terrace"].map((amenity) => {
                  const isSelected = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`px-2 py-1 text-[10px] font-mono uppercase rounded-[2px] border transition-all ${
                        isSelected
                          ? "bg-sage text-white border-sage"
                          : "bg-bg text-ink-soft border-line hover:border-ink"
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-line">
              <Button
                variant="brass"
                size="sm"
                className="w-full"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (cityInput) params.append("city", cityInput);
                  if (selectedType) params.append("type", selectedType);
                  if (maxPrice) params.append("max_price", maxPrice);
                  if (minBeds) params.append("min_beds", minBeds);
                  params.append("name", cityInput ? `${cityInput} Search Alert` : "Custom Search Alert");
                  router.push(`/account/alerts?${params.toString()}`);
                }}
              >
                🔔 Save This Search
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setCityInput("");
                  setSelectedType("");
                  setMaxPrice("");
                  setMinBeds("");
                  setSortOption("newest");
                  setPage(1);
                }}
              >
                Reset Filters
              </Button>
            </div>
          </Card>
        </div>

        {/* Results Main Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between text-xs font-mono text-ink-soft border-b border-line pb-2">
            <span>
              Showing <strong className="text-ink">{listings.length}</strong> of{" "}
              <strong className="text-ink">{totalCount}</strong> properties
            </span>
            <span>Page {page}</span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-mono uppercase text-ink-soft">
              Querying properties database...
            </div>
          ) : listings.length === 0 ? (
            <Card hoverable={false} className="py-16 text-center space-y-3">
              <div className="text-ink-soft text-xl">∅</div>
              <h3 className="font-fraunces text-lg font-medium text-ink">No Listings Found</h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                No active properties match your exact criteria. Try broadening your location or price range.
              </p>
            </Card>
          ) : (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {listings.map((item) => {
                const isFav = isFavorite(item.id);
                return (
                  <Link key={item.id} href={`/listings/${item.id}`}>
                    <Card
                      className={
                        viewMode === "grid"
                          ? "h-full flex flex-col justify-between group relative"
                          : "flex flex-col sm:flex-row gap-4 items-center group relative"
                      }
                    >
                      {/* Heart Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-surface/80 border border-line text-ink hover:text-danger transition-colors"
                        title={isFav ? "Remove Favorite" : "Save Favorite"}
                      >
                        <svg
                          className={`w-4 h-4 ${isFav ? "fill-danger text-danger" : "fill-none"}`}
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </button>

                      <div className={viewMode === "grid" ? "w-full" : "w-full sm:w-48 h-36"}>
                        <div className="h-44 w-full relative mb-3 overflow-hidden rounded-[2px] bg-bg">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0].image_url}
                              alt={item.address}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <HouseSVGPlaceholder hue={item.hue_color || "var(--sage-soft)"} />
                          )}
                          <div className="absolute top-3 left-3 z-10">
                            <Badge variant={item.type === "For Rent" ? "sage" : "brass"}>
                              {item.type}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 w-full">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-mono uppercase text-ink-soft">
                            {item.city}
                          </span>
                          <Badge variant="default">{item.status}</Badge>
                        </div>

                        <h3 className="font-fraunces text-base font-semibold text-ink group-hover:text-brass transition-colors truncate">
                          {item.address}
                        </h3>

                        <p className="text-xs text-ink-soft mt-1 mb-3">
                          {item.beds ? `${item.beds} Beds` : "Commercial"} ·{" "}
                          {item.baths ? `${item.baths} Baths` : ""} ·{" "}
                          {item.sqft ? `${item.sqft.toLocaleString()} sqft` : ""}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t border-line mt-auto">
                          <span className="font-fraunces font-bold text-base text-brass">
                            {formatPrice(item.price, item.type)}
                          </span>
                          <span className="text-[10px] font-mono uppercase text-ink group-hover:translate-x-1 transition-transform">
                            Details →
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Pagination Controls */}
          {totalCount > 9 && (
            <div className="flex items-center justify-center gap-3 pt-6 border-t border-line">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </Button>
              <span className="text-xs font-mono text-ink-soft px-2">
                Page {page} of {Math.ceil(totalCount / 9)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page * 9 >= totalCount}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="py-20 text-center text-xs font-mono uppercase">Loading search engine...</div>}>
          <ListingsContent />
        </Suspense>
      </main>
    </div>
  );
}
