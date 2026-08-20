"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useFavorites } from "@/context/FavoritesContext";
import { Button } from "./Button";
import { Input } from "./Input";
import { Card } from "./Card";

export const Header: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { favoriteCount } = useFavorites();

  // Dropdown States
  const [buyRentOpen, setBuyRentOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Interactive Modal States
  const [showMortgageModal, setShowMortgageModal] = useState(false);
  const [showHomeValuationModal, setShowHomeValuationModal] = useState(false);
  const [showMobileAppModal, setShowMobileAppModal] = useState(false);

  // Mortgage Calculator State
  const [mortgagePrice, setMortgagePrice] = useState(1250000);
  const [mortgageDownPercent, setMortgageDownPercent] = useState(20);
  const [mortgageInterestRate, setMortgageInterestRate] = useState(6.5);
  const [mortgageTermYears, setMortgageTermYears] = useState(30);

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

  // Mobile App Phone Input
  const [appPhone, setAppPhone] = useState("");
  const [appSentMessage, setAppSentMessage] = useState(false);

  // Close dropdowns on outside click
  const navRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
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
  }, []);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Calculate Mortgage Monthly Payment
  const calculateMortgage = () => {
    const principal = mortgagePrice * (1 - mortgageDownPercent / 100);
    const monthlyRate = mortgageInterestRate / 100 / 12;
    const totalPayments = mortgageTermYears * 12;
    let monthlyPI = 0;
    if (monthlyRate === 0 || totalPayments === 0) {
      monthlyPI = principal / (totalPayments || 1);
    } else {
      monthlyPI =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    const monthlyTax = (mortgagePrice * 0.022) / 12;
    const monthlyIns = (mortgagePrice * 0.005) / 12;
    return {
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
        <nav className="hidden md:flex items-center gap-8 font-inter font-semibold text-[15px] text-ink">
          {/* Buy/Rent Dropdown */}
          <div className="relative" onMouseEnter={() => setBuyRentOpen(true)} onMouseLeave={() => setBuyRentOpen(false)}>
            <button
              onClick={() => setBuyRentOpen(!buyRentOpen)}
              className="flex items-center gap-1.5 hover:text-brass transition-colors py-2 font-semibold cursor-pointer"
            >
              <span>Buy/Rent</span>
              <span className="text-[11px] opacity-70">▾</span>
            </button>

            {buyRentOpen && (
              <div className="absolute top-full left-0 w-56 bg-surface border border-line rounded-[4px] shadow-xl py-2 z-50 space-y-1 mt-0">
                <Link
                  href="/listings"
                  className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
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
              </div>
            )}
          </div>

          {/* Home Values Modal Launcher */}
          <button
            onClick={() => setShowHomeValuationModal(true)}
            className="hover:text-brass transition-colors font-semibold py-2 cursor-pointer"
          >
            Home Values
          </button>

          {/* Explore Sub-markets Dropdown */}
          <div className="relative" onMouseEnter={() => setExploreOpen(true)} onMouseLeave={() => setExploreOpen(false)}>
            <button
              onClick={() => setExploreOpen(!exploreOpen)}
              className="flex items-center gap-1.5 hover:text-brass transition-colors py-2 font-semibold cursor-pointer"
            >
              <span>Explore</span>
              <span className="text-[11px] opacity-70">▾</span>
            </button>

            {exploreOpen && (
              <div className="absolute top-full left-0 w-52 bg-surface border border-line rounded-[4px] shadow-xl py-2 z-50 space-y-1 mt-0">
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
              </div>
            )}
          </div>

          {/* Agents Directory Link */}
          <Link href="/agents" className="hover:text-brass transition-colors font-semibold py-2">
            Agents
          </Link>

          {/* Mortgage Calculator Modal Launcher */}
          <button
            onClick={() => setShowMortgageModal(true)}
            className="hover:text-brass transition-colors font-semibold py-2 cursor-pointer"
          >
            Mortgage
          </button>

          {/* More... Dropdown */}
          <div className="relative" onMouseEnter={() => setMoreOpen(true)} onMouseLeave={() => setMoreOpen(false)}>
            <button
              onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1.5 hover:text-brass transition-colors py-2 font-semibold cursor-pointer"
            >
              <span>More...</span>
              <span className="text-[11px] opacity-70">▾</span>
            </button>

            {moreOpen && (
              <div className="absolute top-full right-0 w-56 bg-surface border border-line rounded-[4px] shadow-xl py-2 z-50 space-y-1 mt-0">
                <Link
                  href="/account/alerts"
                  className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                  onClick={() => setMoreOpen(false)}
                >
                  🔔 Saved Search Alerts
                </Link>
                <Link
                  href="/account/favorites"
                  className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                  onClick={() => setMoreOpen(false)}
                >
                  ♥ Saved Favorites ({favoriteCount})
                </Link>
                {user?.role === "agent" && (
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors"
                    onClick={() => setMoreOpen(false)}
                  >
                    🏛 Agent Control Panel
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMoreOpen(false);
                    setShowMobileAppModal(true);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-bg hover:text-brass text-ink font-medium text-sm transition-colors cursor-pointer"
                >
                  📱 Mobile App
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* 3. Right-Side Action Controls */}
        <div className="flex items-center gap-4">
          {/* Mobile App Icon - hidden on small mobile */}
          <button
            onClick={() => setShowMobileAppModal(true)}
            className="hidden md:block text-ink-soft hover:text-brass transition-colors p-1.5 rounded-full hover:bg-bg cursor-pointer"
            title="Get Estateline Mobile App"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Heart Favorites Count Badge - hidden on mobile, shown md+ */}
          <Link
            href="/account/favorites"
            className="relative p-1.5 text-ink hover:text-danger transition-colors hidden md:flex items-center gap-1.5 hover:bg-bg rounded-full"
            title="Saved Favorites"
          >
            <svg className="w-5 h-5 fill-none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="px-1.5 py-0.2 bg-brass text-white text-[11px] font-inter rounded-full min-w-[20px] text-center font-bold">
              {favoriteCount}
            </span>
          </Link>

          {/* Sign In Dropdown - hidden on mobile, shown md+ */}
          <div className="relative hidden md:block">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-bg border border-line rounded-[2px] hover:border-ink transition-colors cursor-pointer"
                >
                  <span className="w-6 h-6 rounded-full bg-brass text-white font-mono text-xs flex items-center justify-center font-bold">
                    {user.full_name.charAt(0)}
                  </span>
                  <span className="text-sm font-bold text-ink max-w-[100px] truncate">
                    {user.full_name.split(" ")[0]}
                  </span>
                  <span className="text-xs text-ink-soft">▾</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 w-52 bg-surface border border-line rounded-[4px] shadow-xl py-2 z-50 space-y-1 mt-1 font-inter">
                    <div className="px-4 py-2 border-b border-line">
                      <span className="block text-xs font-bold text-ink truncate">{user.full_name}</span>
                      <span className="block text-[10px] font-mono text-ink-soft uppercase">{user.role}</span>
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
                  </div>
                )}
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

          {/* List Property Brass Button - Hidden only for Buyers */}
          {(!user || user?.role === "agent") && (
            <Button
              variant="brass"
              size="md"
              onClick={handleListPropertyClick}
              className="hidden sm:inline-flex text-[14px] font-bold px-4 py-2.5 uppercase tracking-wide cursor-pointer"
            >
              List Property
            </Button>
          )}

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-ink hover:text-brass p-2 rounded-md border border-line focus:outline-none cursor-pointer"
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
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-line px-6 py-6 space-y-4 font-inter text-sm shadow-xl animate-fade-in">
          <div className="space-y-2 border-b border-line pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-brass font-bold">Properties & Search</span>
            <Link href="/listings" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-bold text-ink hover:text-brass">
              All Properties
            </Link>
            <Link href="/listings?type=For+Sale" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-ink-soft hover:text-ink">
              Homes For Sale
            </Link>
            <Link href="/listings?type=For+Rent" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-ink-soft hover:text-ink">
              Homes For Rent
            </Link>
            <Link href="/listings?type=Luxury+Villa" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-ink-soft hover:text-ink">
              Luxury Villas & Penthouses
            </Link>
          </div>

          <div className="space-y-2 border-b border-line pb-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-brass font-bold">Real Estate Tools</span>
            <Link href="/compare" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-bold text-ink hover:text-brass">
              📊 Side-by-Side Property Comparison
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowMortgageModal(true);
              }}
              className="block w-full text-left py-1.5 font-bold text-ink hover:text-brass cursor-pointer"
            >
              🧮 30-Year Mortgage Calculator
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowHomeValuationModal(true);
              }}
              className="block w-full text-left py-1.5 font-bold text-ink hover:text-brass cursor-pointer"
            >
              📈 Instant Home Valuation
            </button>
            <Link href="/agents" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 font-bold text-ink hover:text-brass">
              🏛 Real Estate Agents Directory
            </Link>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            {user ? (
              <>
                <div className="px-3 py-2 bg-bg rounded-[8px] border border-line flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-brass text-white font-mono text-sm flex items-center justify-center font-bold">
                    {user.full_name.charAt(0)}
                  </span>
                  <div>
                    <span className="block text-sm font-bold text-ink">{user.full_name}</span>
                    <span className="block text-[10px] font-mono text-ink-soft uppercase">{user.role}</span>
                  </div>
                </div>
                <Link href="/account/favorites" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2 text-sm font-bold text-ink border border-line rounded-[6px] hover:border-brass">
                  ♥ Favorites ({favoriteCount})
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="w-full py-2 text-sm font-bold text-danger border border-danger/30 rounded-[6px] hover:bg-danger/10 cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block text-center py-2.5 text-sm font-bold text-ink border border-line rounded-[6px] hover:border-brass hover:text-brass">
                Sign In →
              </Link>
            )}
            {(!user || user?.role === "agent") && (
              <Button variant="brass" size="md" onClick={() => { setMobileMenuOpen(false); handleListPropertyClick(); }} className="w-full justify-center">
                + List Property
              </Button>
            )}
          </div>
        </div>
      )}

      {/* ------------------- INTERACTIVE MODALS ------------------- */}

      {/* 1. MORTGAGE CALCULATOR MODAL */}
      {showMortgageModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <Card hoverable={false} className="max-w-lg w-full bg-surface relative space-y-6">
            <button
              onClick={() => setShowMortgageModal(false)}
              className="absolute top-4 right-4 text-ink-soft hover:text-ink font-bold text-xl cursor-pointer"
            >
              ✕
            </button>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-brass block mb-1">
                FINANCIAL ADVISORY
              </span>
              <h2 className="font-fraunces text-2xl font-bold text-ink">
                Mortgage & Monthly Payment Calculator<span className="text-brass">.</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Home Purchase Price ($)"
                type="number"
                value={mortgagePrice}
                onChange={(e) => setMortgagePrice(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Down Payment (%)"
                type="number"
                value={mortgageDownPercent}
                onChange={(e) => setMortgageDownPercent(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Interest Rate (%)"
                type="number"
                step="0.1"
                value={mortgageInterestRate}
                onChange={(e) => setMortgageInterestRate(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Loan Term (Years)"
                type="number"
                value={mortgageTermYears}
                onChange={(e) => setMortgageTermYears(parseFloat(e.target.value) || 30)}
              />
            </div>

            <div className="bg-bg p-5 rounded-[4px] border border-line space-y-3 font-mono">
              <div className="flex justify-between text-xs text-ink-soft">
                <span>Principal & Interest:</span>
                <span className="text-ink font-bold">${mortgageCalcs.monthlyPI.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between text-xs text-ink-soft">
                <span>Est. Property Tax (2.2%):</span>
                <span className="text-ink font-bold">${mortgageCalcs.monthlyTax.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between text-xs text-ink-soft">
                <span>Est. Home Insurance:</span>
                <span className="text-ink font-bold">${mortgageCalcs.monthlyIns.toLocaleString()}/mo</span>
              </div>
              <div className="pt-3 border-t border-line flex justify-between items-center text-sm">
                <span className="font-bold text-ink uppercase">Total Estimated Payment:</span>
                <span className="font-fraunces font-bold text-2xl text-brass">
                  ${mortgageCalcs.totalMonthly.toLocaleString()}<span className="text-xs font-mono font-normal">/mo</span>
                </span>
              </div>
            </div>

            <Button variant="brass" className="w-full py-2.5" onClick={() => setShowMortgageModal(false)}>
              Close Calculator
            </Button>
          </Card>
        </div>
      )}

      {/* 2. HOME VALUATION MODAL */}
      {showHomeValuationModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <Card hoverable={false} className="max-w-lg w-full bg-surface relative space-y-6">
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-brass block mb-1">
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
              <div className="bg-brass/10 border border-brass/30 p-5 rounded-[4px] space-y-2">
                <span className="text-[10px] font-mono uppercase text-brass font-bold">
                  ARCHITECTURAL MARKET ESTIMATE
                </span>
                <div className="font-fraunces text-3xl font-bold text-ink">
                  ${valuationResult.estimatedValue.toLocaleString()}
                </div>
                <p className="text-xs text-ink-soft font-mono">
                  Valuation Range: ${valuationResult.rangeLow.toLocaleString()} – ${valuationResult.rangeHigh.toLocaleString()} (${valuationResult.pricePerSqft}/sqft)
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* 3. MOBILE APP MODAL */}
      {showMobileAppModal && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <Card hoverable={false} className="max-w-md w-full bg-surface relative space-y-6 text-center">
            <button
              onClick={() => setShowMobileAppModal(false)}
              className="absolute top-4 right-4 text-ink-soft hover:text-ink font-bold text-xl cursor-pointer"
            >
              ✕
            </button>
            <div className="text- brass text-4xl">📱</div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-brass block mb-1">
                ON THE GO ADVISORY
              </span>
              <h2 className="font-fraunces text-2xl font-bold text-ink">
                Get Estateline Mobile App<span className="text-brass">.</span>
              </h2>
              <p className="text-xs text-ink-soft mt-2 leading-relaxed">
                Scan the QR code or enter your mobile phone number to receive a direct link to download on iOS & Android.
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="w-32 h-32 bg-bg border border-line mx-auto rounded-[8px] flex items-center justify-center p-2 shadow-inner">
              <div className="w-full h-full bg-ink text-white font-mono text-[9px] flex flex-col items-center justify-center p-2 text-center">
                <span>[ QR CODE ]</span>
                <span className="text-brass mt-1 text-[8px]">SCAN TO DOWNLOAD</span>
              </div>
            </div>

            {appSentMessage ? (
              <div className="p-3 bg-brass/10 text-brass font-mono text-xs rounded-[2px]">
                ✓ Download link sent to your mobile phone!
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Enter Phone Number (e.g. 713-555-0199)"
                  value={appPhone}
                  onChange={(e) => setAppPhone(e.target.value)}
                />
                <Button
                  variant="brass"
                  className="w-full py-2.5 text-xs font-mono uppercase"
                  onClick={() => {
                    if (appPhone) setAppSentMessage(true);
                  }}
                >
                  Send SMS App Link →
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}
    </header>
  );
};
