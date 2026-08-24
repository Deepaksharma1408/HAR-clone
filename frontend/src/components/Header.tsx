"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { gsap } from "@/lib/motion/gsap";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Button } from "./Button";
import { Input } from "./Input";
import { Card } from "./Card";
import { MagneticButton } from "./MagneticButton";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname() || "";
  const { user, logout } = useAuth();
  const { favoriteCount } = useFavorites();
  const shouldReduceMotion = useReducedMotion();

  // Dropdown States
  const [buyRentOpen, setBuyRentOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Modal States
  const [showMortgageModal, setShowMortgageModal] = useState(false);
  const [showHomeValuationModal, setShowHomeValuationModal] = useState(false);

  // Active Route Checks
  const isBuyRentActive = pathname === "/listings" || pathname.startsWith("/listings");
  const isHomeValuesActive = pathname === "/home-value";
  const isExploreActive = [
    "/neighborhoods",
    "/open-houses",
    "/schools",
    "/drive-time",
    "/new-homes",
    "/price-drops",
    "/high-rise",
    "/just-listed",
    "/foreclosures",
  ].some((route) => pathname === route || pathname.startsWith(route));
  const isAgentsActive = pathname.startsWith("/agents");
  const isMortgageActive = showMortgageModal;
  const isMoreActive = ["/compare", "/sell", "/account/alerts", "/account/favorites", "/dashboard"].includes(pathname);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mortgage Calculator State
  const [mortgagePriceStr, setMortgagePriceStr] = useState("1250000");
  const [mortgageDownPercentStr, setMortgageDownPercentStr] = useState("20");
  const [mortgageInterestRateStr, setMortgageInterestRateStr] = useState("6.5");
  const [mortgageTermYearsStr, setMortgageTermYearsStr] = useState("30");

  // Home Valuation State
  const [valuationAddress, setValuationAddress] = useState("");
  const [valuationSqft, setValuationSqft] = useState("3200");
  const [valuationBeds, setValuationBeds] = useState("4");
  const [valuationResult, setValuationResult] = useState<{
    estimatedValue: number;
    pricePerSqft: number;
    rangeLow: number;
    rangeHigh: number;
  } | null>(null);
  const [valuationCalculating, setValuationCalculating] = useState(false);

  // Close dropdowns on outside click & GSAP entrance
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (navRef.current && !shouldReduceMotion) {
      gsap.fromTo(
        navRef.current,
        { y: -12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.75, ease: "power3.out" }
      );
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setBuyRentOpen(false);
        setExploreOpen(false);
        setMoreOpen(false);
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shouldReduceMotion]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const parseNum = (val: string, fallback: number = 0) => {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? fallback : parsed;
  };

  // Calculate Mortgage Monthly Payment
  const calculateMortgage = () => {
    const price = parseNum(mortgagePriceStr, 0);
    const downPct = parseNum(mortgageDownPercentStr, 0);
    const ratePct = parseNum(mortgageInterestRateStr, 0);
    const termYrs = parseNum(mortgageTermYearsStr, 0);

    const downAmount = Math.round(price * (downPct / 100));
    const principal = Math.max(0, price - downAmount);
    const monthlyRate = ratePct > 0 ? (ratePct / 100) / 12 : 0;
    const totalPayments = termYrs * 12;

    let monthlyPI = 0;
    if (principal > 0 && totalPayments > 0) {
      if (monthlyRate === 0) {
        monthlyPI = principal / totalPayments;
      } else {
        monthlyPI =
          (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
          (Math.pow(1 + monthlyRate, totalPayments) - 1);
      }
    }

    const monthlyTax = price > 0 ? (price * 0.022) / 12 : 0;
    const monthlyIns = price > 0 ? (price * 0.005) / 12 : 0;

    return {
      price,
      downPct,
      downAmount,
      loanPrincipal: principal,
      monthlyPI: Math.round(monthlyPI || 0),
      monthlyTax: Math.round(monthlyTax || 0),
      monthlyIns: Math.round(monthlyIns || 0),
      totalMonthly: Math.round((monthlyPI || 0) + (monthlyTax || 0) + (monthlyIns || 0)),
    };
  };

  const mortgageCalcs = calculateMortgage();

  // Run Home Valuation Calculation
  const handleValuationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValuationCalculating(true);
    setTimeout(() => {
      const sqft = parseFloat(valuationSqft) || 2800;
      const basePricePerSqft = 385; // Average Houston architectural $/sqft
      const estimatedValue = sqft * basePricePerSqft;
      setValuationResult({
        estimatedValue,
        pricePerSqft: basePricePerSqft,
        rangeLow: Math.round(estimatedValue * 0.94),
        rangeHigh: Math.round(estimatedValue * 1.06),
      });
      setValuationCalculating(false);
    }, 600);
  };

  const handleListPropertyClick = () => {
    if (!user) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <header className="w-full bg-surface border-b border-line sticky top-0 z-50 shadow-xs" ref={navRef}>
      <div className="estateline-container h-20 flex items-center justify-between">
        {/* 1. Logo */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex items-center gap-2 group cursor-pointer hover:opacity-85 transition-opacity"
          aria-label="Estateline Home"
        >
          <span className="font-fraunces text-3xl font-bold tracking-tight text-ink select-none">
            Estateline<span className="text-brass italic font-medium">.</span>
          </span>
        </Link>

        {/* 2. HAR-Style Central Navigation Links */}
        {/* 2. HAR-Style Central Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-inter font-semibold text-[15px] text-ink">
          {/* Buy/Rent Dropdown */}
          <div className="relative" onMouseEnter={() => setBuyRentOpen(true)} onMouseLeave={() => setBuyRentOpen(false)}>
            <button
              onClick={() => setBuyRentOpen(!buyRentOpen)}
              className={`flex items-center gap-1.5 transition-colors py-2 font-semibold cursor-pointer relative ${isBuyRentActive ? "text-brass font-bold" : "text-ink hover:text-brass"
                }`}
            >
              <span>Buy/Rent</span>
              <span className="text-[11px] opacity-70">▾</span>
              {isBuyRentActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brass rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {buyRentOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                  className="absolute top-full left-0 w-56 bg-surface border border-line rounded-xl shadow-xl py-2 z-50 space-y-1 mt-0"
                >
                  <Link
                    href="/listings"
                    className={`block px-4 py-2.5 hover:bg-bg hover:text-brass font-medium text-sm transition-colors ${pathname === "/listings" ? "bg-brass/10 text-brass font-bold border-l-2 border-brass" : "text-ink"
                      }`}
                    onClick={() => setBuyRentOpen(false)}
                  >
                    All Properties
                  </Link>
                  <Link
                    href="/listings?type=For+Sale"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setBuyRentOpen(false)}
                  >
                    Homes For Sale
                  </Link>
                  <Link
                    href="/listings?type=For+Rent"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setBuyRentOpen(false)}
                  >
                    Homes For Rent
                  </Link>
                  <Link
                    href="/listings?type=Luxury+Villa"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setBuyRentOpen(false)}
                  >
                    Luxury Villas
                  </Link>
                  <Link
                    href="/listings?type=Penthouse"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setBuyRentOpen(false)}
                  >
                    Skyline Penthouses
                  </Link>
                  <Link
                    href="/listings?type=Farmhouse"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setBuyRentOpen(false)}
                  >
                    Equestrian Farmhouses
                  </Link>
                  <Link
                    href="/listings?type=Commercial"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setBuyRentOpen(false)}
                  >
                    Commercial Spaces
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Home Values Link */}
          <Link
            href="/home-value"
            className={`transition-colors font-semibold py-2 cursor-pointer relative ${isHomeValuesActive ? "text-brass font-bold" : "text-ink hover:text-brass"
              }`}
          >
            Home Values
            {isHomeValuesActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brass rounded-full" />
            )}
          </Link>

          {/* Explore Sub-markets Dropdown */}
          <div className="relative" onMouseEnter={() => setExploreOpen(true)} onMouseLeave={() => setExploreOpen(false)}>
            <button
              onClick={() => setExploreOpen(!exploreOpen)}
              className={`flex items-center gap-1.5 transition-colors py-2 font-semibold cursor-pointer relative ${isExploreActive ? "text-brass font-bold" : "text-ink hover:text-brass"
                }`}
            >
              <span>Explore</span>
              <span className="text-[11px] opacity-70">▾</span>
              {isExploreActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brass rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {exploreOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                  className="absolute top-full left-0 w-52 bg-surface border border-line rounded-xl shadow-xl py-2 z-50 space-y-1 mt-0"
                >
                  <Link
                    href="/listings?city=Katy"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setExploreOpen(false)}
                  >
                    Katy Sub-market
                  </Link>
                  <Link
                    href="/listings?city=Memorial"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setExploreOpen(false)}
                  >
                    Memorial Estates
                  </Link>
                  <Link
                    href="/listings?city=Heights"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setExploreOpen(false)}
                  >
                    The Heights
                  </Link>
                  <Link
                    href="/listings?city=Sugar+Land"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setExploreOpen(false)}
                  >
                    Sugar Land
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Agents Directory Link */}
          <Link
            href="/agents"
            className={`transition-colors font-semibold py-2 relative ${isAgentsActive ? "text-brass font-bold" : "text-ink hover:text-brass"
              }`}
          >
            Agents
            {isAgentsActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brass rounded-full" />
            )}
          </Link>

          {/* Mortgage Calculator Modal Launcher */}
          <button
            onClick={() => setShowMortgageModal(true)}
            className={`transition-colors font-semibold py-2 cursor-pointer relative ${isMortgageActive ? "text-brass font-bold" : "text-ink hover:text-brass"
              }`}
          >
            Mortgage
            {isMortgageActive && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brass rounded-full" />
            )}
          </button>

          {/* More... Dropdown */}
          <div className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className={`flex items-center gap-1.5 transition-colors py-2 font-semibold cursor-pointer relative ${isMoreActive ? "text-brass font-bold" : "text-ink hover:text-brass"
                }`}
            >
              <span>More...</span>
              <span className="text-[11px] opacity-70">▾</span>
              {isMoreActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-brass rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -4 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "top" }}
                  className="absolute top-full right-0 w-64 bg-surface border border-line rounded-xl shadow-xl py-2 z-50 space-y-1 mt-0 font-inter text-xs"
                >
                  <Link
                    href="/open-houses"
                    className={`block px-4 py-2 hover:bg-bg hover:text-brass font-medium text-xs transition-colors ${pathname === "/open-houses" ? "bg-brass/10 text-brass font-bold border-l-2 border-brass" : "text-ink"
                      }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    🗓️ Weekend Open Houses
                  </Link>
                  <Link
                    href="/sell"
                    className={`block px-4 py-2 hover:bg-bg hover:text-brass font-medium text-xs transition-colors ${pathname === "/sell" ? "bg-brass/10 text-brass font-bold border-l-2 border-brass" : "text-ink"
                      }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    🏷️ Sell &amp; List Your Home
                  </Link>
                  <Link
                    href="/neighborhoods"
                    className={`block px-4 py-2 hover:bg-bg hover:text-brass font-medium text-xs transition-colors ${pathname === "/neighborhoods" ? "bg-brass/10 text-brass font-bold border-l-2 border-brass" : "text-ink"
                      }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    🏘️ Neighborhood Explorer
                  </Link>
                  <Link
                    href="/schools"
                    className={`block px-4 py-2 hover:bg-bg hover:text-brass font-medium text-xs transition-colors ${pathname === "/schools" ? "bg-brass/10 text-brass font-bold border-l-2 border-brass" : "text-ink"
                      }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    🎓 Texas School Finder
                  </Link>
                  <Link
                    href="/drive-time"
                    className={`block px-4 py-2 hover:bg-bg hover:text-brass font-medium text-xs transition-colors ${pathname === "/drive-time" ? "bg-brass/10 text-brass font-bold border-l-2 border-brass" : "text-ink"
                      }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    ⏱️ Commute &amp; Drive-Time Search
                  </Link>
                  <Link
                    href="/compare"
                    className={`block px-4 py-2 hover:bg-bg hover:text-brass font-medium text-xs transition-colors ${pathname === "/compare" ? "bg-brass/10 text-brass font-bold border-l-2 border-brass" : "text-ink"
                      }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    ⚖️ Side-by-Side Property Comparison
                  </Link>
                  <div className="border-t border-line my-1"></div>
                  <Link
                    href="/account/alerts"
                    className={`block px-4 py-2 hover:bg-bg hover:text-brass font-medium text-xs transition-colors ${pathname === "/account/alerts" ? "bg-brass/10 text-brass font-bold border-l-2 border-brass" : "text-ink"
                      }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    🔔 Saved Search Alerts
                  </Link>
                  <Link
                    href="/account/favorites"
                    className={`block px-4 py-2 hover:bg-bg hover:text-brass font-medium text-xs transition-colors ${pathname === "/account/favorites" ? "bg-brass/10 text-brass font-bold border-l-2 border-brass" : "text-ink"
                      }`}
                    onClick={() => setMoreOpen(false)}
                  >
                    ♥ Saved Favorites ({favoriteCount})
                  </Link>
                  {user?.role === "agent" && (
                    <Link
                      href="/dashboard"
                      className={`block px-4 py-2 hover:bg-bg hover:text-brass font-medium text-xs transition-colors ${pathname === "/dashboard" ? "bg-brass/10 text-brass font-bold border-l-2 border-brass" : "text-ink"
                        }`}
                      onClick={() => setMoreOpen(false)}
                    >
                      🏛 Agent Control Panel
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* 3. Right-Side Action Controls */}
        <div className="flex items-center gap-4">

          {/* Heart Favorites Count Badge - hidden on mobile, shown md+ */}
          <Link
            href="/account/favorites"
            className="relative p-2 text-ink hover:text-danger transition-colors hidden md:flex items-center justify-center hover:bg-bg rounded-full cursor-pointer"
            title="Saved Favorites"
          >
            <svg className="w-5 h-5 fill-none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-brass text-white text-[10px] font-inter rounded-full min-w-[18px] text-center font-bold shadow-xs leading-none">
                {favoriteCount}
              </span>
            )}
          </Link>

          {/* Sign In Dropdown - hidden on mobile, shown md+ */}
          <div className="relative hidden md:block">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-bg border border-line rounded-lg hover:border-ink transition-colors cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-brass text-white font-medium text-xs flex items-center justify-center">
                    {user.full_name.charAt(0)}
                  </span>
                  <span className="text-sm font-medium text-ink max-w-[100px] truncate">
                    {user.full_name.split(" ")[0]}
                  </span>
                  <span className="text-xs text-ink-soft">▾</span>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: -4 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      style={{ transformOrigin: "top" }}
                      className="absolute top-full right-0 w-52 bg-surface border border-line rounded-xl shadow-xl py-2 z-50 space-y-1 mt-1 font-inter"
                    >
                      <div className="px-4 py-2 border-b border-line">
                        <span className="block text-xs font-bold text-ink truncate">{user.full_name}</span>
                        <span className="block text-[11px] text-ink-soft capitalize">{user.role}</span>
                      </div>
                      {user.role === "agent" && (
                        <Link
                          href="/dashboard"
                          className="block px-4 py-2 hover:bg-bg hover:text-brass text-sm text-ink"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          🏛 Agent Dashboard
                        </Link>
                      )}
                      <Link
                        href="/account/alerts"
                        className="block px-4 py-2 hover:bg-bg hover:text-brass text-sm text-ink"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        🔔 Saved Search Alerts
                      </Link>
                      <Link
                        href="/account/favorites"
                        className="block px-4 py-2 hover:bg-bg hover:text-brass text-sm text-ink"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        ♥ Saved Favorites ({favoriteCount})
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-danger/10 text-danger text-sm font-semibold border-t border-line mt-1 cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-base font-bold text-ink hover:text-brass transition-colors px-2 py-1"
                >
                  Sign In ▾
                </Link>
              </div>
            )}
          </div>

          {/* List Property Brass Button - Shown on Desktop md+ */}
          {(!user || user?.role === "agent") && (
            <div className="hidden md:block">
              <MagneticButton>
                <Button
                  variant="brass"
                  size="md"
                  onClick={handleListPropertyClick}
                  className="text-[14px] font-bold px-4 py-2.5 uppercase tracking-wide cursor-pointer"
                >
                  List Property
                </Button>
              </MagneticButton>
            </div>
          )}

          {/* Mobile Heart Favorites Icon */}
          <Link
            href="/account/favorites"
            className="md:hidden relative p-2 text-ink hover:text-danger transition-colors flex items-center"
            title="Saved Favorites"
          >
            <svg className="w-5 h-5 fill-none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-brass text-white text-[10px] font-inter rounded-full min-w-[16px] text-center font-bold">
                {favoriteCount}
              </span>
            )}
          </Link>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-ink hover:text-brass p-2 rounded-lg border border-line focus:outline-none cursor-pointer flex items-center justify-center bg-surface"
            aria-label="Toggle Mobile Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Slide-out Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-surface z-50 px-6 py-6 space-y-4 font-inter text-sm shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-line pb-4">
                <span className="font-fraunces font-bold text-xl text-ink">Navigation</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-ink-soft hover:text-ink font-bold text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 border-b border-line pb-4">
                <span className="text-xs font-semibold text-brass block">Properties & Search</span>
                <Link
                  href="/listings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-medium transition-colors ${pathname === "/listings" ? "bg-brass/10 text-brass font-bold px-2.5 rounded-lg border-l-2 border-brass" : "text-ink hover:text-brass"
                    }`}
                >
                  All Properties
                </Link>
                <Link
                  href="/listings?type=For+Sale"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-ink-soft hover:text-ink px-1"
                >
                  Homes For Sale
                </Link>
                <Link
                  href="/listings?type=For+Rent"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-ink-soft hover:text-ink px-1"
                >
                  Homes For Rent
                </Link>
                <Link
                  href="/listings?type=Luxury+Villa"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-ink-soft hover:text-ink px-1"
                >
                  Luxury Villas & Penthouses
                </Link>
              </div>

              <div className="space-y-2 border-b border-line pb-4">
                <span className="text-xs font-semibold text-brass block">Real Estate Tools &amp; Discovery</span>
                <Link
                  href="/open-houses"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-medium transition-colors ${pathname === "/open-houses" ? "bg-brass/10 text-brass font-bold px-2.5 rounded-lg border-l-2 border-brass" : "text-ink hover:text-brass"
                    }`}
                >
                  🗓️ Weekend Open Houses
                </Link>
                <Link
                  href="/sell"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-medium transition-colors ${pathname === "/sell" ? "bg-brass/10 text-brass font-bold px-2.5 rounded-lg border-l-2 border-brass" : "text-ink hover:text-brass"
                    }`}
                >
                  🏷️ Sell &amp; List Your Home
                </Link>
                <Link
                  href="/home-value"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-medium transition-colors ${pathname === "/home-value" ? "bg-brass/10 text-brass font-bold px-2.5 rounded-lg border-l-2 border-brass" : "text-ink hover:text-brass"
                    }`}
                >
                  📈 Home Valuation Estimator
                </Link>
                <Link
                  href="/neighborhoods"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-medium transition-colors ${pathname === "/neighborhoods" ? "bg-brass/10 text-brass font-bold px-2.5 rounded-lg border-l-2 border-brass" : "text-ink hover:text-brass"
                    }`}
                >
                  🏘️ Neighborhood Explorer
                </Link>
                <Link
                  href="/schools"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-medium transition-colors ${pathname === "/schools" ? "bg-brass/10 text-brass font-bold px-2.5 rounded-lg border-l-2 border-brass" : "text-ink hover:text-brass"
                    }`}
                >
                  🎓 Texas School Finder
                </Link>
                <Link
                  href="/drive-time"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-medium transition-colors ${pathname === "/drive-time" ? "bg-brass/10 text-brass font-bold px-2.5 rounded-lg border-l-2 border-brass" : "text-ink hover:text-brass"
                    }`}
                >
                  ⏱️ Commute &amp; Drive-Time Search
                </Link>
                <Link
                  href="/compare"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-medium transition-colors ${pathname === "/compare" ? "bg-brass/10 text-brass font-bold px-2.5 rounded-lg border-l-2 border-brass" : "text-ink hover:text-brass"
                    }`}
                >
                  📊 Side-by-Side Property Comparison
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowMortgageModal(true);
                  }}
                  className="block w-full text-left py-1.5 font-medium text-ink hover:text-brass cursor-pointer px-1"
                >
                  🧮 30-Year Mortgage Calculator
                </button>
                <Link
                  href="/agents"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-1.5 font-medium transition-colors ${pathname.startsWith("/agents") ? "bg-brass/10 text-brass font-bold px-2.5 rounded-lg border-l-2 border-brass" : "text-ink hover:text-brass"
                    }`}
                >
                  🏛 Real Estate Agents Directory
                </Link>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                {user ? (
                  <>
                    <div className="px-3 py-2 bg-bg rounded-xl border border-line flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-brass text-white font-medium text-sm flex items-center justify-center">
                        {user.full_name.charAt(0)}
                      </span>
                      <div>
                        <span className="block text-sm font-medium text-ink">{user.full_name}</span>
                        <span className="block text-xs text-ink-soft capitalize">{user.role}</span>
                      </div>
                    </div>
                    <Link href="/account/favorites" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 text-sm font-medium text-ink border border-line rounded-lg hover:border-brass">
                      ♥ Favorites ({favoriteCount})
                    </Link>
                    <button
                      onClick={() => { setMobileMenuOpen(false); logout(); }}
                      className="w-full py-2 text-sm font-medium text-danger border border-danger/30 rounded-lg hover:bg-danger/10 cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2.5 text-sm font-medium text-ink border border-line rounded-lg hover:border-brass hover:text-brass">
                    Sign In →
                  </Link>
                )}
                {(!user || user?.role === "agent") && (
                  <Button variant="brass" size="md" onClick={() => { setMobileMenuOpen(false); handleListPropertyClick(); }} className="w-full justify-center">
                    + List Property
                  </Button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ------------------- INTERACTIVE PORTAL MODALS ------------------- */}

      {mounted && createPortal(
        <>
          {/* 1. MORTGAGE CALCULATOR MODAL */}
          <AnimatePresence>
            {showMortgageModal && (
              <div className="fixed inset-0 z-[999999] overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center pt-20 sm:pt-24 pb-12">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowMortgageModal(false)}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-lg w-full relative z-10 my-auto shadow-2xl rounded-2xl"
                >
                  <Card hoverable={false} className="w-full bg-surface relative space-y-6 rounded-2xl shadow-2xl p-6 sm:p-8">
                    <button
                      onClick={() => setShowMortgageModal(false)}
                      className="absolute top-4 right-4 text-ink-soft hover:text-ink font-bold text-xl cursor-pointer"
                    >
                      ✕
                    </button>
                    <div>
                      <span className="text-xs font-semibold text-brass block mb-1">
                        FINANCIAL ADVISORY
                      </span>
                      <h2 className="font-fraunces text-2xl font-bold text-ink">
                        Mortgage &amp; Monthly Payment Calculator<span className="text-brass">.</span>
                      </h2>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase text-ink-soft">Custom Financial Parameters</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMortgagePriceStr("");
                          setMortgageDownPercentStr("");
                          setMortgageInterestRateStr("");
                          setMortgageTermYearsStr("");
                        }}
                        className="text-xs text-danger hover:underline cursor-pointer font-medium"
                      >
                        Clear All ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-ink-soft block mb-1">
                          Home Purchase Price ($)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={mortgagePriceStr}
                          onChange={(e) => setMortgagePriceStr(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="e.g. 1250000"
                          className="w-full bg-bg text-ink px-3 py-2.5 rounded-lg border border-line focus:outline-none focus:border-brass text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-ink-soft block mb-1">
                          Down Payment (%)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={mortgageDownPercentStr}
                          onChange={(e) => setMortgageDownPercentStr(e.target.value.replace(/[^0-9.]/g, ""))}
                          placeholder="e.g. 20"
                          className="w-full bg-bg text-ink px-3 py-2.5 rounded-lg border border-line focus:outline-none focus:border-brass text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-ink-soft block mb-1">
                          Interest Rate (%)
                        </label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={mortgageInterestRateStr}
                          onChange={(e) => setMortgageInterestRateStr(e.target.value.replace(/[^0-9.]/g, ""))}
                          placeholder="e.g. 6.5"
                          className="w-full bg-bg text-ink px-3 py-2.5 rounded-lg border border-line focus:outline-none focus:border-brass text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-ink-soft block mb-1">
                          Loan Term (Years)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={mortgageTermYearsStr}
                          onChange={(e) => setMortgageTermYearsStr(e.target.value.replace(/[^0-9]/g, ""))}
                          placeholder="e.g. 30"
                          className="w-full bg-bg text-ink px-3 py-2.5 rounded-lg border border-line focus:outline-none focus:border-brass text-sm"
                        />
                      </div>
                    </div>

                    <div className="bg-bg p-5 rounded-xl border border-line space-y-3 font-inter">
                      <div className="flex justify-between text-xs text-ink-soft">
                        <span>Loan Principal:</span>
                        <span className="text-ink font-semibold">
                          ${mortgageCalcs.loanPrincipal.toLocaleString()}
                          {mortgageCalcs.downAmount > 0 && (
                            <span className="text-[10px] text-ink-soft ml-1">
                              (Down: ${mortgageCalcs.downAmount.toLocaleString()})
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-ink-soft">
                        <span>Principal &amp; Interest:</span>
                        <span className="text-ink font-semibold">${mortgageCalcs.monthlyPI.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between text-xs text-ink-soft">
                        <span>Est. Property Tax (2.2%):</span>
                        <span className="text-ink font-semibold">${mortgageCalcs.monthlyTax.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between text-xs text-ink-soft">
                        <span>Est. Home Insurance (0.5%):</span>
                        <span className="text-ink font-semibold">${mortgageCalcs.monthlyIns.toLocaleString()}/mo</span>
                      </div>
                      <div className="pt-3 border-t border-line flex justify-between items-center text-sm">
                        <span className="font-semibold text-ink">Total Estimated Payment:</span>
                        <span className="font-fraunces font-bold text-2xl text-brass">
                          ${mortgageCalcs.totalMonthly.toLocaleString()}<span className="text-xs font-normal text-ink-soft">/mo</span>
                        </span>
                      </div>
                    </div>

                    <Button variant="brass" className="w-full py-2.5" onClick={() => setShowMortgageModal(false)}>
                      Close
                    </Button>
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* 2. HOME VALUATION MODAL */}
          <AnimatePresence>
            {showHomeValuationModal && (
              <div className="fixed inset-0 z-[999999] overflow-y-auto p-4 sm:p-6 flex items-start sm:items-center justify-center pt-20 sm:pt-24 pb-12">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => {
                    setShowHomeValuationModal(false);
                    setValuationResult(null);
                  }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-lg w-full relative z-10 my-auto shadow-2xl rounded-2xl"
                >
                  <Card hoverable={false} className="w-full bg-surface relative space-y-6 rounded-2xl shadow-2xl p-6 sm:p-8">
                    <button
                      onClick={() => {
                        setShowHomeValuationModal(false);
                        setValuationResult(null);
                      }}
                      className="absolute top-4 right-4 text-ink-soft hover:text-ink font-bold text-xl cursor-pointer"
                    >
                      ✕
                    </button>
                    <div>
                      <span className="text-xs font-semibold text-brass block mb-1">
                        INSTANT MARKET ADVISORY
                      </span>
                      <h2 className="font-fraunces text-2xl font-bold text-ink">
                        Instant Property Valuation Estimator<span className="text-brass">.</span>
                      </h2>
                    </div>

                    <form onSubmit={handleValuationSubmit} className="space-y-4">
                      <Input
                        label="Property Address"
                        required
                        placeholder="1204 Oak Ridge Lane, Katy, TX"
                        value={valuationAddress}
                        onChange={(e) => setValuationAddress(e.target.value)}
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          label="Interior Sqft"
                          type="number"
                          required
                          value={valuationSqft}
                          onChange={(e) => setValuationSqft(e.target.value)}
                        />
                        <Input
                          label="Bedrooms"
                          type="number"
                          value={valuationBeds}
                          onChange={(e) => setValuationBeds(e.target.value)}
                        />
                        <Input label="Bathrooms" type="number" defaultValue="3" />
                      </div>

                      <Button type="submit" variant="brass" className="w-full py-2.5" disabled={valuationCalculating}>
                        {valuationCalculating ? "Calculating Valuation..." : "Get Instant Architectural Valuation →"}
                      </Button>
                    </form>

                    {valuationResult && (
                      <div className="bg-brass/10 border border-brass/30 p-5 rounded-xl space-y-2">
                        <span className="text-xs font-semibold text-brass block">
                          ARCHITECTURAL MARKET ESTIMATE
                        </span>
                        <div className="font-fraunces text-3xl font-bold text-ink">
                          ${valuationResult.estimatedValue.toLocaleString()}
                        </div>
                        <p className="text-xs text-ink-soft">
                          Valuation Range: ${valuationResult.rangeLow.toLocaleString()} – ${valuationResult.rangeHigh.toLocaleString()} (${valuationResult.pricePerSqft}/sqft)
                        </p>
                      </div>
                    )}
                  </Card>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </header>
  );
};
