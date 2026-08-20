"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { Reveal } from "@/components/Reveal";
import { StatCounter } from "@/components/StatCounter";
import { getApiUrl, getImageUrl } from "@/lib/config";

interface StatsData {
  total_listings: number;
  active_listings: number;
  agent_count: number;
}

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

interface AgentItem {
  id: number;
  role_title: string;
  bio: string | null;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
}

const PropertyCardHoverSlider: React.FC<{
  images?: { id: number; image_url: string; order: number }[];
  fallbackUrl?: string;
  address: string;
  type: string;
  hueColor?: string | null;
}> = ({ images, fallbackUrl, address, type, hueColor }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const imageList = React.useMemo(() => {
    if (images && images.length > 0) {
      return images.map((img) => getImageUrl(img.image_url));
    }
    const mainImg = fallbackUrl || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80";
    return [
      mainImg,
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80", // Interior Living Room
      "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=800&q=80", // Marble Kitchen
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80", // Master Suite / Terrace
    ];
  }, [images, fallbackUrl]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHovered && imageList.length > 1) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % imageList.length);
      }, 2000); // 2.0 Seconds Slideshow Speed
    } else {
      setCurrentIndex(0);
    }
    return () => clearInterval(interval);
  }, [isHovered, imageList.length]);

  return (
    <div
      className="h-48 w-full relative mb-4 overflow-hidden rounded-[2px] bg-bg group/slider cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <img
        src={imageList[currentIndex]}
        alt={`${address} photo ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300 group-hover/slider:scale-105"
      />

      <div className="absolute top-3 left-3 z-10">
        <Badge variant={type === "For Rent" ? "sage" : "brass"}>{type}</Badge>
      </div>

      {/* Slide Indicators Dots */}
      {imageList.length > 1 && (
        <div className="absolute bottom-2.5 left-0 right-0 z-20 flex justify-center gap-1.5 px-2">
          {imageList.map((_, dotIdx) => (
            <span
              key={dotIdx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                dotIdx === currentIndex
                  ? "w-4 bg-brass shadow-md"
                  : "w-1.5 bg-white/70 backdrop-blur-xs"
              }`}
            />
          ))}
        </div>
      )}

      {/* Hover Counter Tag */}
      {isHovered && (
        <div className="absolute top-3 right-3 z-20 bg-black/70 text-white font-mono text-[9px] px-2 py-0.5 rounded-[2px] backdrop-blur-xs uppercase tracking-wider">
          {currentIndex === 0
            ? "1/4 Exterior"
            : currentIndex === 1
            ? "2/4 Living Room"
            : currentIndex === 2
            ? "3/4 Kitchen"
            : "4/4 Master Suite"}
        </div>
      )}
    </div>
  );
};

export default function HomePage() {
  const router = useRouter();

  // Search Bar State
  const [searchCity, setSearchCity] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchMaxPrice, setSearchMaxPrice] = useState("");

  // HAR Tool Shortcuts Carousel State
  const shortcutRef = useRef<HTMLDivElement>(null);

  const scrollShortcuts = (direction: "left" | "right") => {
    if (shortcutRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      shortcutRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const harToolShortcuts = [
    {
      label: "Open House",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      bg: "bg-blue-600",
      link: "/open-houses",
    },
    {
      label: "Just Listed",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      bg: "bg-emerald-600",
      link: "/just-listed",
    },
    {
      label: "New Homes",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4" />
        </svg>
      ),
      bg: "bg-pink-600",
      link: "/new-homes",
    },
    {
      label: "Recent Price Changes",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
      bg: "bg-purple-600",
      link: "/price-drops",
    },
    {
      label: "Apartment Search",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4" />
        </svg>
      ),
      bg: "bg-amber-600",
      link: "/listings?tag=apartment",
    },
    {
      label: "Rental Properties",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
      ),
      bg: "bg-indigo-600",
      link: "/listings?type=For+Rent",
    },
    {
      label: "Commercial Properties",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M3 10h18M3 7l9-4 9 4M8 14v3m4-3v3m4-3v3" />
        </svg>
      ),
      bg: "bg-rose-600",
      link: "/listings?type=Commercial",
    },
    {
      label: "Global Properties",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3.6 9h16.8M3.6 15h16.8" />
        </svg>
      ),
      bg: "bg-teal-600",
      link: "/listings?tag=global",
    },
    {
      label: "Luxury Homes",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      bg: "bg-yellow-600",
      link: "/listings?type=Luxury+Villa",
    },
    {
      label: "Land & Acreage",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v16h14V3H5zm0 16l4-4 4 4 4-4 2 2" />
        </svg>
      ),
      bg: "bg-emerald-700",
      link: "/listings?type=Farmhouse",
    },
    {
      label: "Foreclosed Homes",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      bg: "bg-slate-700",
      link: "/foreclosures",
    },
    {
      label: "Track Home Value",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m2 0h2a2 2 0 002-2v-5a2 2 0 00-.586-1.414l-7-7a2 2 0 00-2.828 0l-7 7A2 2 0 003 12v5a2 2 0 002 2h2" />
        </svg>
      ),
      bg: "bg-rose-700",
      link: "/home-value",
    },
    {
      label: "Explore Neighborhoods",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      bg: "bg-amber-700",
      link: "/neighborhoods",
    },
    {
      label: "School Finder",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      bg: "bg-lime-600",
      link: "/schools",
    },
    {
      label: "Drive Time",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      bg: "bg-cyan-600",
      link: "/drive-time",
    },
    {
      label: "High-Rise Finder",
      svg: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4" />
        </svg>
      ),
      bg: "bg-sky-600",
      link: "/high-rise",
    },
  ];

  // Backend Data States
  const [stats, setStats] = useState<StatsData>({ total_listings: 10, active_listings: 10, agent_count: 4 });
  const [featuredListings, setFeaturedListings] = useState<ListingItem[]>([]);
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Philosophy Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const carouselSlides = [
    {
      src: "/arch-living.jpg",
      title: "Double-Height Modern Living",
      tag: "01 / INTERIOR ARCHITECTURE",
    },
    {
      src: "/hero-villa.jpg",
      title: "Twilight Infinity Pool Villa",
      tag: "02 / COASTAL LANDSCAPING",
    },
    {
      src: "/arch-kitchen.jpg",
      title: "Italian Marble Culinary Suite",
      tag: "03 / CULINARY REFINEMENT",
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = getApiUrl();
        // Fetch stats
        const statsRes = await fetch(`${apiUrl}/listings/stats`);
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        // Fetch first 6 listings
        const listingsRes = await fetch(`${apiUrl}/listings?page_size=6`);
        if (listingsRes.ok) {
          const listingsData = await listingsRes.json();
          setFeaturedListings(listingsData.results || []);
        }

        // Fetch agents
        const agentsRes = await fetch(`${apiUrl}/agents`);
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json();
          setAgents((agentsData || []).slice(0, 4));
        }
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.append("city", searchCity);
    if (searchType) params.append("type", searchType);
    if (searchMaxPrice) params.append("max_price", searchMaxPrice);

    router.push(`/listings?${params.toString()}`);
  };

  const formatPrice = (price: number, type: string) => {
    if (type === "For Rent") {
      return `$${price.toLocaleString()}/mo`;
    }
    return `$${price.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Header />

      {/* Hero Section with Live Panning Luxury Farmhouse Background (75% Length) */}
      <section className="relative h-[75vh] min-h-[600px] flex items-center justify-center border-b border-line overflow-hidden">
        {/* Live Panning Luxury Farmhouse Background (Left -> Right -> Left) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="/hero-farmhouse.jpg"
            alt="Ultra Luxury Farmhouse Estate"
            className="w-full h-full object-cover animate-live-pan"
          />
          {/* Subtle dark gradient overlay so the live moving luxury farmhouse photo remains vivid and crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/55" />
        </div>

        <div className="estateline-container relative z-10">
          {/* Hero Heading Text */}
          <div className="max-w-3xl mx-auto text-center mb-10">
            <Reveal>
              <div className="inline-block px-3 py-1 bg-brass/90 text-white font-mono text-[10px] uppercase tracking-widest rounded-[2px] mb-3 shadow-sm">
                Estateline Portal
              </div>
              <h1 className="font-fraunces text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight drop-shadow-md">
                Connecting Buyers and Renters with Their Dream Home<span className="text-brass">!</span>
              </h1>
              <p className="text-base text-white/90 font-medium mt-3 max-w-xl mx-auto drop-shadow-sm">
                Discover curated residential estates, luxury villas, and commercial properties.
              </p>
            </Reveal>
          </div>

          {/* HAR-Style Floating White Search Card Component */}
          <Reveal delayMs={150}>
            <div className="bg-surface border border-line p-6 md:p-8 rounded-[16px] shadow-2xl max-w-3xl mx-auto font-inter">
              {/* Category Tabs - horizontally scrollable on mobile */}
              <div className="flex items-center gap-4 sm:gap-8 border-b border-line pb-3.5 mb-6 text-sm font-inter font-bold tracking-wider overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
                <button
                  onClick={() => setSearchType("")}
                  className={`flex-shrink-0 pb-2 transition-all cursor-pointer ${
                    searchType === ""
                      ? "text-brass border-b-2 border-brass font-bold"
                      : "text-ink-soft/80 hover:text-ink font-semibold"
                  }`}
                >
                  ALL
                </button>
                <button
                  onClick={() => setSearchType("For Sale")}
                  className={`flex-shrink-0 pb-2 transition-all cursor-pointer ${
                    searchType === "For Sale"
                      ? "text-brass border-b-2 border-brass font-bold"
                      : "text-ink-soft/80 hover:text-ink font-semibold"
                  }`}
                >
                  BUY
                </button>
                <button
                  onClick={() => setSearchType("For Rent")}
                  className={`flex-shrink-0 pb-2 transition-all cursor-pointer ${
                    searchType === "For Rent"
                      ? "text-brass border-b-2 border-brass font-bold"
                      : "text-ink-soft/80 hover:text-ink font-semibold"
                  }`}
                >
                  RENT
                </button>
                <button
                  onClick={() => setSearchType("Luxury Villa")}
                  className={`flex-shrink-0 pb-2 transition-all cursor-pointer ${
                    searchType === "Luxury Villa"
                      ? "text-brass border-b-2 border-brass font-bold"
                      : "text-ink-soft/80 hover:text-ink font-semibold"
                  }`}
                >
                  VILLAS
                </button>
                <button
                  onClick={() => setSearchType("Penthouse")}
                  className={`flex-shrink-0 pb-2 transition-all cursor-pointer ${
                    searchType === "Penthouse"
                      ? "text-brass border-b-2 border-brass font-bold"
                      : "text-ink-soft/80 hover:text-ink font-semibold"
                  }`}
                >
                  PENTHOUSES
                </button>
                <button
                  onClick={() => setSearchType("Farmhouse")}
                  className={`flex-shrink-0 pb-2 transition-all cursor-pointer ${
                    searchType === "Farmhouse"
                      ? "text-brass border-b-2 border-brass font-bold"
                      : "text-ink-soft/80 hover:text-ink font-semibold"
                  }`}
                >
                  FARMHOUSES
                </button>
              </div>

              {/* Main Search Input & Filters */}
              <form onSubmit={handleSearchSubmit} className="space-y-4">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Enter Address, City, or Zip Code..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full bg-bg text-ink placeholder:text-ink-soft/70 px-6 py-4 pr-16 text-base font-inter font-semibold rounded-[30px] border border-line focus:outline-none focus:border-brass transition-colors shadow-inner"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 p-3 bg-brass hover:bg-brass-deep text-white rounded-full transition-colors flex items-center justify-center cursor-pointer shadow-md"
                    title="Search Properties"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>

                {/* Sub-filter Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <Select
                    label="Property Type"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    options={[
                      { value: "", label: "Type: All" },
                      { value: "For Sale", label: "For Sale" },
                      { value: "For Rent", label: "For Rent" },
                      { value: "Luxury Villa", label: "Luxury Villa" },
                      { value: "Penthouse", label: "Skyline Penthouse" },
                      { value: "Farmhouse", label: "Equestrian Farmhouse" },
                      { value: "Commercial", label: "Commercial" },
                    ]}
                  />

                  <Select
                    label="Max Budget"
                    value={searchMaxPrice}
                    onChange={(e) => setSearchMaxPrice(e.target.value)}
                    options={[
                      { value: "", label: "Budget: Any" },
                      { value: "500000", label: "Under $500k" },
                      { value: "1000000", label: "Under $1.0M" },
                      { value: "3000000", label: "Under $3.0M" },
                      { value: "10000000", label: "$3.0M+" },
                    ]}
                  />

                  <div className="flex items-end">
                    <Button type="submit" variant="brass" className="w-full py-2.5 text-xs font-mono uppercase">
                      Search Properties →
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Dynamic Animated Stat Counters */}
      <section className="py-12 bg-surface border-b border-line">
        <div className="estateline-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center border-l border-line/60 pl-6">
              <span className="block text-xs font-mono uppercase text-ink-soft tracking-wider">
                Total Properties
              </span>
              <span className="block mt-1">
                <StatCounter value={stats.total_listings} className="text-3xl font-bold text-ink" />
              </span>
            </div>

            <div className="text-center border-l border-line/60 pl-6">
              <span className="block text-xs font-mono uppercase text-ink-soft tracking-wider">
                Active Listings
              </span>
              <span className="block mt-1">
                <StatCounter value={stats.active_listings} className="text-3xl font-bold text-ink" />
              </span>
            </div>

            <div className="text-center border-l border-line/60 pl-6">
              <span className="block text-xs font-mono uppercase text-ink-soft tracking-wider">
                Licensed Agents
              </span>
              <span className="block mt-1">
                <StatCounter value={stats.agent_count} className="text-3xl font-bold text-ink" />
              </span>
            </div>

            <div className="text-center border-l border-line/60 pl-6">
              <span className="block text-xs font-mono uppercase text-ink-soft tracking-wider">
                Portfolio Volume
              </span>
              <span className="block mt-1">
                <StatCounter value={32} prefix="$" suffix="M+" className="text-3xl font-bold text-ink" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* HAR Quick Tool Shortcuts Carousel & Feature Action Cards */}
      <section className="py-12 bg-bg border-b border-line">
        <div className="estateline-container space-y-12">
          
          {/* 1. Quick Tool Shortcuts Horizontal Carousel */}
          <div className="relative group">
            {/* Left Scroll Button */}
            <button
              onClick={() => scrollShortcuts("left")}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-surface border border-line text-ink flex items-center justify-center shadow-md hover:bg-brass hover:text-white transition-colors cursor-pointer"
              aria-label="Scroll Left"
            >
              ‹
            </button>

            {/* Carousel Scroll Track */}
            <div
              ref={shortcutRef}
              className="flex items-center gap-4 overflow-x-auto scrollbar-none py-2 px-2 scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {harToolShortcuts.map((tool, idx) => (
                <Link
                  key={idx}
                  href={tool.link}
                  className="flex-shrink-0 w-28 sm:w-32 bg-surface border border-line rounded-[12px] p-3 text-center hover:shadow-lg hover:border-brass transition-all duration-300 group/card cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 mx-auto mb-2 rounded-full ${tool.bg} text-white flex items-center justify-center text-lg shadow-sm group-hover/card:scale-110 transition-transform`}
                  >
                    {tool.svg}
                  </div>
                  <span className="block text-xs font-inter font-bold text-ink group-hover/card:text-brass transition-colors leading-tight">
                    {tool.label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Right Scroll Button */}
            <button
              onClick={() => scrollShortcuts("right")}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-surface border border-line text-ink flex items-center justify-center shadow-md hover:bg-brass hover:text-white transition-colors cursor-pointer"
              aria-label="Scroll Right"
            >
              ›
            </button>
          </div>

          {/* 2. HAR 4 Feature Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Want to buy your dream home? */}
            <div className="bg-surface border border-line rounded-[16px] p-6 flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div>
                <h3 className="font-fraunces text-xl font-bold text-ink mb-2">
                  Want to buy your dream home?
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed mb-6">
                  Browse Texas property listings with Estateline&apos;s powerful search tool.
                </p>
                <Link
                  href="/listings?type=For+Sale"
                  className="text-xs font-inter font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                >
                  Search for your home →
                </Link>
              </div>
              <div className="mt-6 pt-4 border-t border-line/40 overflow-hidden rounded-[12px]">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
                  alt="Buy Dream Home"
                  className="w-full h-36 object-cover rounded-[12px] group-hover:scale-105 transition-transform duration-500 shadow-sm"
                />
              </div>
            </div>

            {/* Card 2: Finding your perfect rental home? */}
            <div className="bg-surface border border-line rounded-[16px] p-6 flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div>
                <h3 className="font-fraunces text-xl font-bold text-ink mb-2">
                  Finding your perfect rental home?
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed mb-6">
                  Search Estateline for thousands of homes, condos and apartments for rent.
                </p>
                <Link
                  href="/listings?type=For+Rent"
                  className="text-xs font-inter font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                >
                  View rental homes →
                </Link>
              </div>
              <div className="mt-6 pt-4 border-t border-line/40 overflow-hidden rounded-[12px]">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80"
                  alt="Rental Homes"
                  className="w-full h-36 object-cover rounded-[12px] group-hover:scale-105 transition-transform duration-500 shadow-sm"
                />
              </div>
            </div>

            {/* Card 3: Ready for the right mortgage and financing? */}
            <div className="bg-surface border border-line rounded-[16px] p-6 flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div>
                <h3 className="font-fraunces text-xl font-bold text-ink mb-2">
                  Ready for the right mortgage & financing?
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed mb-6">
                  Learn about mortgage, find local lenders, mortgage rates, and advisory tools.
                </p>
                <Link
                  href="/listings"
                  className="text-xs font-inter font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                >
                  Get started →
                </Link>
              </div>
              <div className="mt-6 pt-4 border-t border-line/40 overflow-hidden rounded-[12px]">
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80"
                  alt="Mortgage & Financing"
                  className="w-full h-36 object-cover rounded-[12px] group-hover:scale-105 transition-transform duration-500 shadow-sm"
                />
              </div>
            </div>

            {/* Card 4: Browse for fun! */}
            <div className="bg-surface border border-line rounded-[16px] p-6 flex flex-col justify-between hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div>
                <h3 className="font-fraunces text-xl font-bold text-ink mb-2">
                  Browse for fun!
                </h3>
                <p className="text-xs text-ink-soft leading-relaxed mb-6">
                  Estateline has many tools. Compare home values, school stats, neighborhood info.
                </p>
                <Link
                  href="/listings"
                  className="text-xs font-inter font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1"
                >
                  Explore your options →
                </Link>
              </div>
              <div className="mt-6 pt-4 border-t border-line/40 overflow-hidden rounded-[12px]">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
                  alt="Browse Neighborhoods"
                  className="w-full h-36 object-cover rounded-[12px] group-hover:scale-105 transition-transform duration-500 shadow-sm"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Listings Grid (First 6 Active Listings) */}
      <section className="py-20 estateline-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 border-b border-line pb-4">
          <div>
            <EyebrowLabel>Selected Listings</EyebrowLabel>
            <h2 className="font-fraunces text-3xl font-semibold text-ink mt-1">
              Featured Properties<span className="text-brass">.</span>
            </h2>
          </div>
          <Link href="/listings" className="mt-4 sm:mt-0">
            <Button variant="ghost" size="sm">
              View All Listings →
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs font-mono uppercase text-ink-soft">
            Loading architectural portfolio...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredListings.map((item) => (
              <Link key={item.id} href={`/listings/${item.id}`}>
                <Card className="h-full flex flex-col justify-between group">
                  <div>
                    <PropertyCardHoverSlider
                      images={item.images}
                      address={item.address}
                      type={item.type}
                      hueColor={item.hue_color}
                    />

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono uppercase text-ink-soft truncate">
                        {item.city}
                      </span>
                      <Badge variant="default">{item.status}</Badge>
                    </div>

                    <h3 className="font-fraunces text-lg font-semibold text-ink group-hover:text-brass transition-colors mb-1 truncate">
                      {item.address}
                    </h3>

                    <p className="text-xs text-ink-soft mb-4">
                      {item.beds ? `${item.beds} Beds` : "Commercial"} ·{" "}
                      {item.baths ? `${item.baths} Baths` : ""} ·{" "}
                      {item.sqft ? `${item.sqft.toLocaleString()} sqft` : ""}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-line mt-auto">
                    <span className="font-fraunces font-bold text-lg text-brass">
                      {formatPrice(item.price, item.type)}
                    </span>
                    <span className="text-xs font-mono uppercase text-ink group-hover:translate-x-1 transition-transform">
                      Inspect →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Special Curated Collections: Penthouses, Luxury Villas, & Farmhouses */}
      <section className="py-20 bg-surface border-y border-line">
        <div className="estateline-container">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 border-b border-line pb-4">
            <div>
              <EyebrowLabel>Signature Categories</EyebrowLabel>
              <h2 className="font-fraunces text-3xl font-semibold text-ink mt-1">
                Luxury Villas, Penthouses & Farmhouses<span className="text-brass">.</span>
              </h2>
            </div>
            <Link href="/listings" className="mt-4 sm:mt-0">
              <Button variant="ghost" size="sm">
                Explore All Categories →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Collection 1: Skyline Penthouses */}
            <Link href="/listings?type=Penthouse" className="group">
              <Card className="h-full bg-bg hover:bg-surface flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="h-56 w-full relative mb-4 overflow-hidden rounded-[2px]">
                    <img
                      src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"
                      alt="Skyline Penthouse Collection"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="brass">PENTHOUSE</Badge>
                    </div>
                  </div>
                  <h3 className="font-fraunces text-xl font-bold text-ink group-hover:text-brass transition-colors mb-2">
                    Skyline Penthouses
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed mb-4">
                    Panoramic high-rise towers featuring private rooftop terraces, floor-to-ceiling glass walls, and concierge elevator service.
                  </p>
                </div>
                <div className="pt-3 border-t border-line text-xs font-mono uppercase text-brass font-bold flex items-center justify-between">
                  <span>Browse Penthouses</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Card>
            </Link>

            {/* Collection 2: Luxury Villas */}
            <Link href="/listings?type=Luxury+Villa" className="group">
              <Card className="h-full bg-bg hover:bg-surface flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="h-56 w-full relative mb-4 overflow-hidden rounded-[2px]">
                    <img
                      src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"
                      alt="Luxury Villa Collection"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="sage">LUXURY VILLA</Badge>
                    </div>
                  </div>
                  <h3 className="font-fraunces text-xl font-bold text-ink group-hover:text-brass transition-colors mb-2">
                    Mediterranean & Modern Villas
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed mb-4">
                    Resort-style coastal and lakefront estates equipped with infinity pools, private docks, and expansive outdoor cabanas.
                  </p>
                </div>
                <div className="pt-3 border-t border-line text-xs font-mono uppercase text-brass font-bold flex items-center justify-between">
                  <span>Browse Luxury Villas</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Card>
            </Link>

            {/* Collection 3: Equestrian Farmhouses */}
            <Link href="/listings?type=Farmhouse" className="group">
              <Card className="h-full bg-bg hover:bg-surface flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="h-56 w-full relative mb-4 overflow-hidden rounded-[2px]">
                    <img
                      src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
                      alt="Equestrian Farmhouse Collection"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant="default">FARMHOUSE</Badge>
                    </div>
                  </div>
                  <h3 className="font-fraunces text-xl font-bold text-ink group-hover:text-brass transition-colors mb-2">
                    Equestrian Farmhouses
                  </h3>
                  <p className="text-xs text-ink-soft leading-relaxed mb-4">
                    Private country ranches featuring rolling acreage, horse barns, pond views, and modern rustic architectural interiors.
                  </p>
                </div>
                <div className="pt-3 border-t border-line text-xs font-mono uppercase text-brass font-bold flex items-center justify-between">
                  <span>Browse Farmhouses</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* HAR "Browse through Texas real estate" 9-Card Grid Section (Generous Side Padding & Inter Bold Sans-Serif Typography) */}
      <section className="py-20 bg-bg border-b border-line">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-inter font-black text-3xl sm:text-4xl text-ink tracking-tight">
              Browse through Texas real estate<span className="text-brass">.</span>
            </h2>
            <p className="text-xs text-ink-soft font-inter mt-2">
              Explore specialized real estate categories, neighborhood tools, and Texas market statistics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Commercial Properties */}
            <div className="bg-surface border border-line/80 rounded-[18px] p-6 hover:shadow-xl hover:border-brass/80 transition-all duration-300 flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="inline-block px-3.5 py-1 bg-emerald-100 text-emerald-900 font-inter font-bold text-[13px] rounded-full mb-3">
                  Commercial Properties
                </span>
                <p className="text-xs text-ink-soft leading-relaxed mb-6 font-inter">
                  View commercial properties for sale or lease in Texas.
                </p>
              </div>
              <Link
                href="/listings?type=Commercial"
                className="text-[13px] font-inter font-bold text-blue-600 group-hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
              >
                View Commercial Properties →
              </Link>
            </div>

            {/* Card 2: Global Properties */}
            <div className="bg-surface border border-line/80 rounded-[18px] p-6 hover:shadow-xl hover:border-brass/80 transition-all duration-300 flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="inline-block px-3.5 py-1 bg-rose-100 text-rose-900 font-inter font-bold text-[13px] rounded-full mb-3">
                  Global Properties
                </span>
                <p className="text-xs text-ink-soft leading-relaxed mb-6 font-inter">
                  Find properties around the globe.
                </p>
              </div>
              <Link
                href="/listings?tag=global"
                className="text-[13px] font-inter font-bold text-blue-600 group-hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
              >
                View Global Properties →
              </Link>
            </div>

            {/* Card 3: Agents & Brokers */}
            <div className="bg-surface border border-line/80 rounded-[18px] p-6 hover:shadow-xl hover:border-brass/80 transition-all duration-300 flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="inline-block px-3.5 py-1 bg-amber-100 text-amber-900 font-inter font-bold text-[13px] rounded-full mb-3">
                  Agents & Brokers
                </span>
                <p className="text-xs text-ink-soft leading-relaxed mb-6 font-inter">
                  Get help from thousands of available professionals.
                </p>
              </div>
              <Link
                href="/agents"
                className="text-[13px] font-inter font-bold text-blue-600 group-hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
              >
                View Agents & Brokers →
              </Link>
            </div>

            {/* Card 4: Home Values */}
            <div className="bg-surface border border-line/80 rounded-[18px] p-6 hover:shadow-xl hover:border-brass/80 transition-all duration-300 flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="inline-block px-3.5 py-1 bg-purple-100 text-purple-900 font-inter font-bold text-[13px] rounded-full mb-3">
                  Home Values
                </span>
                <p className="text-xs text-ink-soft leading-relaxed mb-6 font-inter">
                  Figure out the home values around a neighborhood.
                </p>
              </div>
              <Link
                href="/listings?tag=valuation"
                className="text-[13px] font-inter font-bold text-blue-600 group-hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
              >
                View Home Values →
              </Link>
            </div>

            {/* Card 5: Schools */}
            <div className="bg-surface border border-line/80 rounded-[18px] p-6 hover:shadow-xl hover:border-brass/80 transition-all duration-300 flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="inline-block px-3.5 py-1 bg-sky-100 text-sky-900 font-inter font-bold text-[13px] rounded-full mb-3">
                  Schools
                </span>
                <p className="text-xs text-ink-soft leading-relaxed mb-6 font-inter">
                  Compare school ratings, and demographic make-up.
                </p>
              </div>
              <Link
                href="/listings?city=Katy"
                className="text-[13px] font-inter font-bold text-blue-600 group-hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
              >
                View Schools →
              </Link>
            </div>

            {/* Card 6: Neighborhoods */}
            <div className="bg-surface border border-line/80 rounded-[18px] p-6 hover:shadow-xl hover:border-brass/80 transition-all duration-300 flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="inline-block px-3.5 py-1 bg-indigo-100 text-indigo-900 font-inter font-bold text-[13px] rounded-full mb-3">
                  Neighborhoods
                </span>
                <p className="text-xs text-ink-soft leading-relaxed mb-6 font-inter">
                  Get the most out of your Neighborhood.
                </p>
              </div>
              <Link
                href="/listings?city=Memorial"
                className="text-[13px] font-inter font-bold text-blue-600 group-hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
              >
                View Neighborhoods →
              </Link>
            </div>

            {/* Card 7: High-Rise */}
            <div className="bg-surface border border-line/80 rounded-[18px] p-6 hover:shadow-xl hover:border-brass/80 transition-all duration-300 flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="inline-block px-3.5 py-1 bg-stone-200 text-stone-900 font-inter font-bold text-[13px] rounded-full mb-3">
                  High-Rise
                </span>
                <p className="text-xs text-ink-soft leading-relaxed mb-6 font-inter">
                  Find your perfect High-Rise home in Texas today!
                </p>
              </div>
              <Link
                href="/listings?type=Penthouse"
                className="text-[13px] font-inter font-bold text-blue-600 group-hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
              >
                View High-Rise →
              </Link>
            </div>

            {/* Card 8: Estateline Member Area */}
            <div className="bg-surface border border-line/80 rounded-[18px] p-6 hover:shadow-xl hover:border-brass/80 transition-all duration-300 flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="inline-block px-3.5 py-1 bg-teal-100 text-teal-900 font-inter font-bold text-[13px] rounded-full mb-3">
                  Estateline Member Area
                </span>
                <p className="text-xs text-ink-soft leading-relaxed mb-6 font-inter">
                  Get to know the benefits and tools of the Estateline Membership.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="text-[13px] font-inter font-bold text-blue-600 group-hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
              >
                View Member Area →
              </Link>
            </div>

            {/* Card 9: Map Search */}
            <div className="bg-surface border border-line/80 rounded-[18px] p-6 hover:shadow-xl hover:border-brass/80 transition-all duration-300 flex flex-col justify-between group min-h-[160px]">
              <div>
                <span className="inline-block px-3.5 py-1 bg-orange-100 text-orange-900 font-inter font-bold text-[13px] rounded-full mb-3">
                  Map Search
                </span>
                <p className="text-xs text-ink-soft leading-relaxed mb-6 font-inter">
                  View all Real Estate and Homes for Sale in Texas.
                </p>
              </div>
              <Link
                href="/listings"
                className="text-[13px] font-inter font-bold text-blue-600 group-hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
              >
                View Map Search →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* "Why Us" Architectural Split Section */}
      <section className="py-20 bg-surface border-y border-line">
        <div className="estateline-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Ultra-Luxury Architectural Gallery Carousel */}
            <div className="h-96 w-full relative overflow-hidden rounded-[4px] border border-line shadow-xl bg-bg group">
              {carouselSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
                >
                  <img
                    src={slide.src}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Subtle gradient vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  
                  {/* Slide Label Badge & Title */}
                  <div className="absolute bottom-4 left-4 right-4 text-white z-20">
                    <span className="inline-block px-2.5 py-1 bg-brass text-white text-[10px] font-mono uppercase tracking-wider rounded-[2px] mb-1">
                      {slide.tag}
                    </span>
                    <h4 className="font-fraunces text-lg font-bold text-white drop-shadow-sm">
                      {slide.title}
                    </h4>
                  </div>
                </div>
              ))}

              {/* Prev / Next Navigation Controls */}
              <button
                onClick={() =>
                  setCurrentSlide((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1))
                }
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-surface/80 hover:bg-surface text-ink border border-line transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                aria-label="Previous Slide"
              >
                ←
              </button>
              <button
                onClick={() =>
                  setCurrentSlide((prev) => (prev + 1) % carouselSlides.length)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-surface/80 hover:bg-surface text-ink border border-line transition-all opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                aria-label="Next Slide"
              >
                →
              </button>

              {/* Slide Indicator Dots */}
              <div className="absolute bottom-3 right-4 z-30 flex items-center gap-1.5">
                {carouselSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      idx === currentSlide ? "w-6 bg-brass" : "w-1.5 bg-white/60 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Copy Content */}
            <div className="space-y-6">
              <EyebrowLabel>Architectural Philosophy</EyebrowLabel>
              <h2 className="font-fraunces text-3xl md:text-4xl font-semibold text-ink leading-tight">
                Designed for precision<span className="text-brass">,</span> built for permanence<span className="text-brass">.</span>
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed">
                At Estateline, we eliminate generic template cards and uninspired real estate listings. Every home in our portfolio is presented through an architectural lens — prioritizing structural details, hairline boundaries, and accurate historical pricing.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-line text-xs font-mono uppercase">
                <div>
                  <span className="text-brass font-bold block mb-1">01 / Structural Hairlines</span>
                  <span className="text-ink-soft">Strict 1px separations, zero bubbly frames.</span>
                </div>
                <div>
                  <span className="text-brass font-bold block mb-1">02 / Verified Records</span>
                  <span className="text-ink-soft">Complete price transparency & history.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Agent Preview Grid (4 Agents) */}
      <section className="py-20 estateline-container">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 border-b border-line pb-4">
          <div>
            <EyebrowLabel>Expert Advisory</EyebrowLabel>
            <h2 className="font-fraunces text-3xl font-semibold text-ink mt-1">
              Meet Our Agents<span className="text-brass">.</span>
            </h2>
          </div>
          <Link href="/agents" className="mt-4 sm:mt-0">
            <Button variant="ghost" size="sm">
              View All Agents →
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.id}`}>
              <Card className="h-full flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-[2px] bg-sage-soft text-sage flex items-center justify-center font-fraunces font-bold text-xl mb-4 group-hover:bg-brass group-hover:text-white transition-colors">
                    {agent.user.full_name.charAt(0)}
                  </div>
                  <h3 className="font-fraunces text-base font-semibold text-ink group-hover:text-brass transition-colors">
                    {agent.user.full_name}
                  </h3>
                  <span className="block text-[10px] font-mono uppercase text-ink-soft mt-1">
                    {agent.role_title}
                  </span>
                  <p className="text-xs text-ink-soft/80 mt-3 line-clamp-3">
                    {agent.bio}
                  </p>
                </div>
                <div className="pt-4 border-t border-line mt-4 flex items-center justify-between text-xs font-mono uppercase text-brass font-medium">
                  <span>View Profile</span>
                  <span>→</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Stay Connected & Real Insight Articles Section */}
      <section className="py-16 bg-surface border-t border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
          {/* 1. Stay Connected Header & Social Bar */}
          <div className="text-center space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-ink-soft block font-semibold">
              SOCIAL NETWORKS & STORE
            </span>
            <h2 className="font-fraunces text-3xl sm:text-4xl font-bold text-ink tracking-tight">
              Stay connected to Estateline
            </h2>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.67a1.6 1.6 0 0 0-1.6 1.6c0 .88.72 1.6 1.6 1.6s1.6-.72 1.6-1.6c0-.88-.72-1.6-1.6-1.6z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>

              <div className="h-6 w-px bg-line mx-2"></div>

              <a href="#" className="flex items-center gap-2 text-sm font-inter font-bold text-blue-700 hover:text-blue-900 transition-colors">
                <svg className="w-5 h-5 stroke-current" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
                <span>REALTOR® Store</span>
              </a>
            </div>
          </div>

          {/* 2. Informative Articles Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-inter font-black text-2xl text-ink tracking-tight">
                Informative articles to empower you
              </h3>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-inter text-ink-soft">Recommended By</span>
                <div className="border-2 border-blue-600 text-blue-600 font-inter font-black text-[10px] tracking-tighter px-1.5 py-0.5 rounded leading-none flex flex-col items-center">
                  <span>REAL</span>
                  <span>INSIGHT</span>
                </div>
              </div>
            </div>

            {/* 4 Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Article 1 */}
              <div className="bg-surface border border-line rounded-[16px] overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="p-6 flex-1 space-y-2">
                  <h4 className="font-inter font-bold text-sm text-ink group-hover:text-blue-600 transition-colors leading-snug">
                    Why Townhomes Are a Secret Weapon for First-Time Buyers
                  </h4>
                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                    Townhomes can offer first-time buyers a practical path to homeownership, combining affordability, lower maintenance and desirable locations.
                  </p>
                </div>
                <div className="w-full sm:w-44 h-36 relative overflow-hidden bg-bg flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"
                    alt="Townhomes"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Article 2 */}
              <div className="bg-surface border border-line rounded-[16px] overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="p-6 flex-1 space-y-2">
                  <h4 className="font-inter font-bold text-sm text-ink group-hover:text-blue-600 transition-colors leading-snug">
                    5 Signs You're Financially Ready to Buy a Home
                  </h4>
                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                    Think you're ready to buy a home? Learn five financial signs that can help you decide if now is the right time to make your move.
                  </p>
                </div>
                <div className="w-full sm:w-44 h-36 relative overflow-hidden bg-bg flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80"
                    alt="Financially Ready"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Article 3 */}
              <div className="bg-surface border border-line rounded-[16px] overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="p-6 flex-1 space-y-2">
                  <h4 className="font-inter font-bold text-sm text-ink group-hover:text-blue-600 transition-colors leading-snug">
                    Want to Buy a Home in 2027? Here is What to Prepare Right Now
                  </h4>
                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                    Planning to buy a home in 2027? Learn the financial steps you can take today to make your future home purchase easier and less stressful.
                  </p>
                </div>
                <div className="w-full sm:w-44 h-36 relative overflow-hidden bg-bg flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80"
                    alt="Prepare Financials"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>

              {/* Article 4 */}
              <div className="bg-surface border border-line rounded-[16px] overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition-shadow group cursor-pointer">
                <div className="p-6 flex-1 space-y-2">
                  <h4 className="font-inter font-bold text-sm text-ink group-hover:text-blue-600 transition-colors leading-snug">
                    5 Steps to Take Before Making an Offer
                  </h4>
                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                    Buying a home soon? Learn the key steps to take before making an offer so you can shop with confidence and avoid common homebuying mistakes.
                  </p>
                </div>
                <div className="w-full sm:w-44 h-36 relative overflow-hidden bg-bg flex-shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=600&q=80"
                    alt="Making an offer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <a href="#" className="text-xs font-inter font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1">
                View more articles →
              </a>
            </div>
          </div>

          {/* 3. Real Insight Newsletter Subscription Banner */}
          <div className="bg-[#EBF0FF] rounded-[20px] p-8 md:p-10 border border-blue-100 flex flex-col md:flex-row items-start md:items-center gap-8 shadow-sm">
            {/* Logo Badge */}
            <div className="border-2 border-blue-600 text-blue-600 font-inter font-black text-sm tracking-tighter px-4 py-3 rounded-lg leading-tight text-center bg-white shadow-xs flex-shrink-0">
              <div className="text-base font-extrabold border-b border-blue-200 pb-0.5">REAL</div>
              <div className="text-xs font-semibold pt-0.5">INSIGHT</div>
            </div>

            {/* Newsletter Details & Input */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-inter font-extrabold text-lg text-ink">
                  Stay updated with real estate industry trends, news, and insights
                </h3>
                <p className="text-xs text-ink-soft mt-1">
                  Subscribe to receive valuable articles, local market statistics, and information tailored to your needs.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl">
                <input
                  type="email"
                  placeholder="What's your email?"
                  className="w-full sm:flex-1 px-4 py-2.5 bg-white border border-blue-200 rounded-[8px] text-xs font-inter focus:outline-none focus:border-blue-600 shadow-xs"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#FF0055] hover:bg-[#E6004C] text-white font-inter font-bold text-xs rounded-[8px] transition-colors cursor-pointer shadow-md"
                >
                  Subscribe
                </button>
              </form>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-ink-soft gap-2 pt-1">
                <span>
                  By subscribing, you accept our <a href="#" className="underline hover:text-ink">privacy policy</a>
                </span>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-ink">Go to RealInsight</span>
                  <span>or Follow Us</span>
                  <div className="flex items-center gap-1.5 ml-1">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">f</span>
                    <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[9px]">X</span>
                    <span className="w-5 h-5 rounded-full bg-[#0A66C2] text-white flex items-center justify-center text-[9px]">in</span>
                    <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px]">▶</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valuation CTA Banner */}
      <section className="py-16 bg-sage text-white border-t border-line">
        <div className="estateline-container flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <span className="text-xs font-mono uppercase text-sage-soft tracking-widest block mb-2">
              Property Owners & Sellers
            </span>
            <h2 className="font-fraunces text-3xl font-semibold">
              Considering listing your property?
            </h2>
            <p className="text-xs text-sage-soft mt-2 max-w-lg">
              Receive a precise architectural market valuation and connect with specialized local agents.
            </p>
          </div>
          <Link href="/sell">
            <Button variant="brass" size="lg" className="border border-white/20">
              Request Valuation →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-line py-8">
        <div className="estateline-container flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-ink-soft gap-4">
          <span>&copy; {new Date().getFullYear()} Estateline Inc. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-ink">Terms of Architectural Integrity</Link>
            <Link href="/" className="hover:text-ink">Privacy Protocol</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
