"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Select } from "@/components/Select";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { HouseSVGPlaceholder } from "@/components/HouseSVGPlaceholder";
import { MapPlaceholder } from "@/components/MapPlaceholder";

import { getApiUrl, getImageUrl } from "@/lib/config";

interface PriceHistory {
  id: number;
  date: string;
  event: string;
  price_label: string;
}

interface AgentProfile {
  id: number;
  role_title: string;
  bio: string | null;
  user?: {
    id: number;
    full_name: string;
    email: string;
  };
}

interface ListingDetail {
  id: number;
  agent_id: number;
  address: string;
  city: string;
  price: number;
  type: string;
  status: string;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lot_size: number | null;
  description: string | null;
  hue_color: string | null;
  created_at: string;
  images: { id: number; image_url: string }[];
  price_history: PriceHistory[];
  agent?: AgentProfile;
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [similarListings, setSimilarListings] = useState<ListingDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Mortgage Calculator State
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRatePct, setInterestRatePct] = useState(6.5);
  const [termYears, setTermYears] = useState(30);

  // Contact Form State
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadMessage, setLeadMessage] = useState("");
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  // Pre-Approval Modal & Amortization Schedule state
  const [showPreApprovalModal, setShowPreApprovalModal] = useState(false);
  const [preApprovalSubmitted, setPreApprovalSubmitted] = useState(false);
  const [showAmortizationTable, setShowAmortizationTable] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiUrl = getApiUrl();
        const res = await fetch(`${apiUrl}/listings/${listingId}`);
        if (res.ok) {
          const data = await res.json();
          setListing(data);
        }

        const similarRes = await fetch(`${apiUrl}/listings/${listingId}/similar`);
        if (similarRes.ok) {
          const similarData = await similarRes.json();
          setSimilarListings(similarData || []);
        }
      } catch (err) {
        console.error("Error loading listing details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [listingId]);

  // Mortgage Payment Math
  const calculateMonthlyPayment = () => {
    if (!listing || listing.type === "For Rent") return 0;
    const price = listing.price;
    const principal = price * (1 - downPaymentPct / 100);
    const monthlyRate = interestRatePct / 100 / 12;
    const totalPayments = termYears * 12;

    if (monthlyRate === 0) return principal / totalPayments;

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    return Math.round(monthlyPayment);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitting(true);
    setLeadError(null);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/listings/${listingId}/leads`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone || null,
          message: leadMessage,
        }),
      });

      if (res.ok) {
        setLeadSuccess(true);
        setLeadName("");
        setLeadPhone("");
        setLeadMessage("");
      } else {
        const errData = await res.json();
        setLeadError(errData.detail || "Unable to send inquiry.");
      }
    } catch (err) {
      console.error(err);
      setLeadError("Network error sending inquiry.");
    } finally {
      setLeadSubmitting(false);
    }
  };

  const formatPrice = (price: number, type: string) => {
    if (type === "For Rent") return `$${price.toLocaleString()}/mo`;
    return `$${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center text-xs font-mono uppercase text-ink-soft">
          Loading architectural specification...
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <Card hoverable={false} className="max-w-md py-12">
            <h1 className="font-fraunces text-2xl font-semibold text-ink">Property Not Found</h1>
            <p className="text-xs text-ink-soft mt-2 mb-6">
              The listing you requested does not exist or has been unpublished.
            </p>
            <Link href="/listings">
              <Button variant="brass" size="sm">Back to Search</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  // Generate 4 photo hues for gallery placeholders
  const galleryHues = [
    listing.hue_color || "var(--sage-soft)",
    "rgba(184, 134, 46, 0.12)",
    "rgba(22, 35, 28, 0.08)",
    "var(--sage-soft)",
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Header />

      <main className="flex-1 estateline-container py-10 space-y-10">
        {/* Header Title & Pricing Bar */}
        <div className="border-b border-line pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={listing.type === "For Rent" ? "sage" : "brass"}>
                {listing.type}
              </Badge>
              <Badge variant="default">{listing.status}</Badge>
              <span className="text-xs font-mono uppercase text-ink-soft">— {listing.city}</span>
            </div>
            <h1 className="font-fraunces text-3xl md:text-4xl font-semibold text-ink">
              {listing.address}
            </h1>
            <p className="text-xs font-mono text-ink-soft mt-1">
              ID #{listing.id} · Listed in {listing.city}, Texas
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-left md:text-right">
              <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-soft">
                Asking Price
              </span>
              <span className="font-fraunces font-bold text-3xl md:text-4xl text-brass">
                {formatPrice(listing.price, listing.type)}
              </span>
            </div>

            {/* Action Bar: PDF Datasheet, Compare, Pre-Approval */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-surface hover:bg-bg border border-line rounded-[8px] text-xs font-inter font-bold text-ink flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="Download / Print PDF Datasheet"
              >
                <span>📄</span>
                <span>Print PDF Flyer</span>
              </button>

              <Link href="/compare">
                <button className="px-3.5 py-2 bg-surface hover:bg-bg border border-line rounded-[8px] text-xs font-inter font-bold text-ink flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs">
                  <span>📊</span>
                  <span>Compare</span>
                </button>
              </Link>

              <button
                onClick={() => setShowPreApprovalModal(true)}
                className="px-4 py-2 bg-brass hover:bg-brass-deep text-white rounded-[8px] text-xs font-inter font-bold transition-colors cursor-pointer shadow-sm"
              >
                Apply Pre-Approval →
              </button>
            </div>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-96">
          {/* Main Large Photo */}
          <div className="md:col-span-2 h-full overflow-hidden rounded-[2px] bg-bg relative">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={getImageUrl(listing.images[0].image_url)}
                alt={listing.address}
                className="w-full h-full object-cover"
              />
            ) : (
              <HouseSVGPlaceholder hue={galleryHues[0]} className="h-full" />
            )}
          </div>
          {/* Side Photo Grid */}
          <div className="grid grid-rows-2 gap-4 h-full">
            <div className="h-full overflow-hidden rounded-[2px] bg-bg relative">
              {listing.images && listing.images.length > 1 ? (
                <img
                  src={getImageUrl(listing.images[1].image_url)}
                  alt={listing.address}
                  className="w-full h-full object-cover"
                />
              ) : (
                <HouseSVGPlaceholder hue={galleryHues[1]} className="h-full" />
              )}
            </div>
            <div className="h-full overflow-hidden rounded-[2px] bg-bg relative">
              {listing.images && listing.images.length > 2 ? (
                <img
                  src={getImageUrl(listing.images[2].image_url)}
                  alt={listing.address}
                  className="w-full h-full object-cover"
                />
              ) : (
                <HouseSVGPlaceholder hue={galleryHues[2]} className="h-full" />
              )}
            </div>
          </div>
        </div>

        {/* Spec Grid & Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Main Property Overview */}
          <div className="lg:col-span-2 space-y-10">
            {/* Specs Bar */}
            <Card hoverable={false} className="bg-surface grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-line/60">
              <div className="text-center">
                <span className="block text-[10px] font-mono uppercase text-ink-soft">Bedrooms</span>
                <span className="font-fraunces text-2xl font-bold text-ink mt-1">
                  {listing.beds ?? "N/A"}
                </span>
              </div>
              <div className="text-center pl-4">
                <span className="block text-[10px] font-mono uppercase text-ink-soft">Bathrooms</span>
                <span className="font-fraunces text-2xl font-bold text-ink mt-1">
                  {listing.baths ?? "N/A"}
                </span>
              </div>
              <div className="text-center pl-4">
                <span className="block text-[10px] font-mono uppercase text-ink-soft">Interior Sqft</span>
                <span className="font-fraunces text-2xl font-bold text-ink mt-1">
                  {listing.sqft ? listing.sqft.toLocaleString() : "N/A"}
                </span>
              </div>
              <div className="text-center pl-4">
                <span className="block text-[10px] font-mono uppercase text-ink-soft">Lot Acres</span>
                <span className="font-fraunces text-2xl font-bold text-ink mt-1">
                  {listing.lot_size ? `${listing.lot_size} ac` : "N/A"}
                </span>
              </div>
            </Card>

            {/* Architectural Description */}
            <div className="space-y-3">
              <EyebrowLabel>Property Narrative</EyebrowLabel>
              <h2 className="font-fraunces text-2xl font-semibold text-ink">
                Architectural Overview
              </h2>
              <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">
                {listing.description || "No description provided."}
              </p>
            </div>

            {/* Price History Table */}
            <div className="space-y-4">
              <EyebrowLabel>Transparency & Audit</EyebrowLabel>
              <h2 className="font-fraunces text-2xl font-semibold text-ink">
                Price History
              </h2>

              <Card hoverable={false} className="p-0 overflow-hidden bg-surface">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-bg font-mono uppercase text-[10px] text-ink-soft">
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Event</th>
                      <th className="py-3 px-4 font-semibold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {listing.price_history && listing.price_history.length > 0 ? (
                      listing.price_history.map((entry) => (
                        <tr key={entry.id} className="hover:bg-bg/50">
                          <td className="py-3 px-4 font-mono text-ink-soft">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                entry.event === "Listed"
                                  ? "brass"
                                  : entry.event === "Price Cut"
                                  ? "danger"
                                  : "sage"
                              }
                            >
                              {entry.event}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right font-fraunces font-bold text-ink">
                            {entry.price_label}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-xs font-mono text-ink-soft">
                          No historical price changes recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>

            {/* Map Placeholder */}
            <div className="space-y-4">
              <EyebrowLabel>Geographic Location</EyebrowLabel>
              <h2 className="font-fraunces text-2xl font-semibold text-ink">
                Location & Context
              </h2>
              <MapPlaceholder address={listing.address} city={listing.city} />
            </div>

            {/* Live Client-Side Mortgage Calculator */}
            {listing.type !== "For Rent" && (
              <div className="space-y-4">
                <EyebrowLabel>Financial Estimator</EyebrowLabel>
                <h2 className="font-fraunces text-2xl font-semibold text-ink">
                  Mortgage Amortization
                </h2>
                <Card hoverable={false} className="bg-surface space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Down Payment Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-2">
                        <span className="text-ink-soft uppercase">Down Payment</span>
                        <span className="font-bold text-brass">{downPaymentPct}% (${Math.round(listing.price * (downPaymentPct / 100)).toLocaleString()})</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        step="5"
                        value={downPaymentPct}
                        onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                        className="w-full accent-brass cursor-pointer"
                      />
                    </div>

                    {/* Interest Rate Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-mono mb-2">
                        <span className="text-ink-soft uppercase">Interest Rate</span>
                        <span className="font-bold text-brass">{interestRatePct}%</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="10"
                        step="0.25"
                        value={interestRatePct}
                        onChange={(e) => setInterestRatePct(Number(e.target.value))}
                        className="w-full accent-brass cursor-pointer"
                      />
                    </div>

                    {/* Term Select */}
                    <Select
                      label="Loan Term"
                      value={termYears.toString()}
                      onChange={(e) => setTermYears(Number(e.target.value))}
                      options={[
                        { value: "30", label: "30 Years Fixed" },
                        { value: "15", label: "15 Years Fixed" },
                      ]}
                    />
                  </div>

                  {/* Calculated Output */}
                  <div className="pt-4 border-t border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-ink-soft block">
                        Estimated Monthly Payment (Principal & Interest)
                      </span>
                      <span className="text-xs text-ink-soft">Taxes and insurance calculated separately</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-fraunces font-bold text-3xl text-brass">
                        ${calculateMonthlyPayment().toLocaleString()} / mo
                      </span>
                    </div>
                  </div>

                  {/* Amortization Schedule Toggle Button */}
                  <div className="pt-2 flex justify-between items-center border-t border-line/60">
                    <button
                      onClick={() => setShowAmortizationTable(!showAmortizationTable)}
                      className="text-xs font-inter font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                    >
                      {showAmortizationTable ? "Hide Amortization Schedule ▲" : "View 30-Year Yearly Amortization Schedule ▼"}
                    </button>

                    <button
                      onClick={() => setShowPreApprovalModal(true)}
                      className="px-3.5 py-1.5 bg-brass hover:bg-brass-deep text-white text-xs font-inter font-bold rounded-[6px] shadow-xs cursor-pointer"
                    >
                      Get Pre-Approved with Preferred Lenders →
                    </button>
                  </div>

                  {/* 30-Year Amortization Breakdown Table */}
                  {showAmortizationTable && (
                    <div className="mt-4 pt-4 border-t border-line overflow-x-auto space-y-2">
                      <span className="text-xs font-mono uppercase text-ink-soft font-bold block">30-Year Yearly Amortization Schedule</span>
                      <table className="w-full text-left text-xs font-inter">
                        <thead>
                          <tr className="border-b border-line text-ink-soft font-mono uppercase">
                            <th className="py-2">Year</th>
                            <th className="py-2">Principal Paid</th>
                            <th className="py-2">Interest Paid</th>
                            <th className="py-2">Remaining Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line/60">
                          {[1, 5, 10, 15, 20, 25, 30].map((yr) => {
                            const initialLoan = listing.price * (1 - downPaymentPct / 100);
                            const yearlyP = Math.round((calculateMonthlyPayment() * 12) * (0.35 + yr * 0.02));
                            const yearlyI = Math.round((calculateMonthlyPayment() * 12) - yearlyP);
                            const remBal = Math.max(0, Math.round(initialLoan * (1 - yr / 30)));
                            return (
                              <tr key={yr} className="hover:bg-bg/40">
                                <td className="py-2 font-bold text-ink">Year {yr}</td>
                                <td className="py-2 text-emerald-700 font-bold">${yearlyP.toLocaleString()}</td>
                                <td className="py-2 text-rose-700">${yearlyI.toLocaleString()}</td>
                                <td className="py-2 font-mono text-ink-soft">${remBal.toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar: Agent Info & Contact Form */}
          <div className="space-y-6 sticky top-28">
            {/* Agent Profile Box */}
            {listing.agent && (
              <Card hoverable={false} className="bg-surface">
                <EyebrowLabel className="mb-2">Listing Representative</EyebrowLabel>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-[2px] bg-brass text-white font-fraunces font-bold text-lg flex items-center justify-center">
                    {listing.agent.user?.full_name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <h3 className="font-fraunces font-semibold text-ink text-base">
                      {listing.agent.user?.full_name || "Agent"}
                    </h3>
                    <span className="block text-[10px] font-mono uppercase text-ink-soft">
                      {listing.agent.role_title}
                    </span>
                  </div>
                </div>
                {listing.agent.bio && (
                  <p className="text-xs text-ink-soft line-clamp-3 mb-4">{listing.agent.bio}</p>
                )}
                <Link href={`/agents/${listing.agent.id}`}>
                  <Button variant="outline" size="sm" className="w-full">
                    View Agent Profile →
                  </Button>
                </Link>
              </Card>
            )}

            {/* Contact Agent Form */}
            <Card hoverable={false} className="bg-surface">
              <h3 className="font-fraunces text-lg font-semibold text-ink mb-1">
                Inquire About Property
              </h3>
              <p className="text-xs text-ink-soft mb-4">
                Send a message directly to the listing agent for private viewing schedules.
              </p>

              {leadSuccess ? (
                <div className="p-4 bg-sage-soft border border-sage/30 text-center space-y-2 rounded-[2px]">
                  <span className="text-brass font-bold text-xl">✓</span>
                  <h4 className="font-fraunces font-semibold text-ink">Inquiry Submitted</h4>
                  <p className="text-xs text-ink-soft">
                    Your message was transmitted to the listing agent.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  {leadError && (
                    <div className="p-2 bg-danger/10 text-danger text-[10px] font-mono uppercase rounded-[2px]">
                      {leadError}
                    </div>
                  )}

                  <Input
                    label="Your Name"
                    required
                    value={leadName}
                    onChange={(e) => setLeadName(e.target.value)}
                    placeholder="Jane Doe"
                    disabled={leadSubmitting}
                  />

                  <Input
                    label="Phone Number"
                    type="tel"
                    value={leadPhone}
                    onChange={(e) => setLeadPhone(e.target.value)}
                    placeholder="(832) 555-0199"
                    disabled={leadSubmitting}
                  />

                  <Textarea
                    label="Message"
                    required
                    rows={3}
                    value={leadMessage}
                    onChange={(e) => setLeadMessage(e.target.value)}
                    placeholder="I would like to schedule a private tour for this property..."
                    disabled={leadSubmitting}
                  />

                  <Button
                    type="submit"
                    variant="brass"
                    className="w-full py-3"
                    disabled={leadSubmitting}
                  >
                    {leadSubmitting ? "Transmitting..." : "Send Inquiry"}
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>

        {/* Similar Listings Row */}
        {similarListings.length > 0 && (
          <div className="pt-12 border-t border-line space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <EyebrowLabel>Complementary Options</EyebrowLabel>
                <h2 className="font-fraunces text-3xl font-semibold text-ink mt-1">
                  Similar Active Properties<span className="text-brass">.</span>
                </h2>
              </div>
              <Link href="/listings">
                <Button variant="ghost" size="sm">Browse All →</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {similarListings.map((sim) => (
                <Link key={sim.id} href={`/listings/${sim.id}`}>
                  <Card className="h-full flex flex-col justify-between group">
                    <div>
                      <div className="h-44 w-full relative mb-3">
                        <HouseSVGPlaceholder hue={sim.hue_color || "var(--sage-soft)"} />
                        <div className="absolute top-3 left-3">
                          <Badge variant={sim.type === "For Rent" ? "sage" : "brass"}>
                            {sim.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono uppercase text-ink-soft">{sim.city}</span>
                        <Badge variant="default">{sim.status}</Badge>
                      </div>

                      <h3 className="font-fraunces text-base font-semibold text-ink group-hover:text-brass transition-colors truncate">
                        {sim.address}
                      </h3>

                      <p className="text-xs text-ink-soft mt-1 mb-3">
                        {sim.beds ? `${sim.beds} Beds` : "Commercial"} ·{" "}
                        {sim.baths ? `${sim.baths} Baths` : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-line mt-auto">
                      <span className="font-fraunces font-bold text-base text-brass">
                        {formatPrice(sim.price, sim.type)}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-ink group-hover:translate-x-1 transition-transform">
                        Details →
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Lender Pre-Approval Modal */}
        {showPreApprovalModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-surface p-8 rounded-[20px] max-w-lg w-full border border-line space-y-5 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 text-xs font-mono uppercase rounded-full">
                    🏦 Preferred Texas Mortgage Lenders
                  </span>
                  <h3 className="font-fraunces text-2xl font-bold text-ink mt-2">
                    Apply for Loan Pre-Approval Letter
                  </h3>
                </div>
                <button
                  onClick={() => setShowPreApprovalModal(false)}
                  className="text-ink-soft hover:text-ink text-xl font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {preApprovalSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-[12px] text-center space-y-3">
                  <div className="text-3xl">🎉</div>
                  <h4 className="font-fraunces font-bold text-lg text-emerald-950">Pre-Approval Application Sent!</h4>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    Our partner Texas mortgage underwriters are reviewing your financial profile for <strong className="text-emerald-950">${listing.price.toLocaleString()}</strong> and will issue your pre-qualification letter within 4 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setPreApprovalSubmitted(false);
                      setShowPreApprovalModal(false);
                    }}
                    className="w-full py-2.5 bg-ink text-white font-inter font-bold text-xs rounded-[8px] cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPreApprovalSubmitted(true);
                  }}
                  className="space-y-4 text-xs font-inter"
                >
                  <div>
                    <label className="block font-mono uppercase text-ink-soft mb-1">Full Legal Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2 bg-bg border border-line rounded-[8px] focus:outline-none focus:border-brass"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono uppercase text-ink-soft mb-1">Annual Household Income</label>
                      <input
                        type="text"
                        required
                        placeholder="$145,000"
                        className="w-full px-4 py-2 bg-bg border border-line rounded-[8px] focus:outline-none focus:border-brass"
                      />
                    </div>
                    <div>
                      <label className="block font-mono uppercase text-ink-soft mb-1">Credit Score Estimate</label>
                      <select className="w-full px-4 py-2 bg-bg border border-line rounded-[8px] focus:outline-none focus:border-brass">
                        <option>740+ (Excellent)</option>
                        <option>700-739 (Good)</option>
                        <option>660-699 (Fair)</option>
                        <option>Below 660</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono uppercase text-ink-soft mb-1">Preferred Loan Type</label>
                    <select className="w-full px-4 py-2 bg-bg border border-line rounded-[8px] focus:outline-none focus:border-brass">
                      <option>30-Year Conventional Fixed</option>
                      <option>15-Year Conventional Fixed</option>
                      <option>FHA Loan (3.5% Down)</option>
                      <option>VA Loan (0% Down for Veterans)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-brass hover:bg-brass-deep text-white font-inter font-bold text-xs rounded-[8px] transition-colors cursor-pointer shadow-md mt-2"
                  >
                    Submit Financial Application →
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
