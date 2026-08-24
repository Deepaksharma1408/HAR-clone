"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Select } from "@/components/Select";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { HouseSVGPlaceholder } from "@/components/HouseSVGPlaceholder";
import { MapPlaceholder } from "@/components/MapPlaceholder";
import { MagneticButton } from "@/components/MagneticButton";
import { TextMaskReveal } from "@/components/motion/TextMaskReveal";
import { ImageCurtainReveal } from "@/components/motion/ImageCurtainReveal";
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
  const shouldReduceMotion = useReducedMotion();

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [similarListings, setSimilarListings] = useState<ListingDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

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

  // Pre-Approval Modal & Amortization Schedule & Lightbox state
  const [showPreApprovalModal, setShowPreApprovalModal] = useState(false);
  const [preApprovalSubmitted, setPreApprovalSubmitted] = useState(false);
  const [showAmortizationTable, setShowAmortizationTable] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);

  // Keyboard navigation for Lightbox fullscreen viewer
  useEffect(() => {
    if (!showLightbox) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActivePhotoIndex((prev) => (prev + 1) % (listing?.images?.length || 1));
      } else if (e.key === "ArrowLeft") {
        setActivePhotoIndex((prev) => (prev - 1 + (listing?.images?.length || 1)) % (listing?.images?.length || 1));
      } else if (e.key === "Escape") {
        setShowLightbox(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showLightbox, listing?.images?.length]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
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
        <div className="flex-1 flex items-center justify-center text-xs font-mono uppercase text-ink-soft">
          Loading architectural specification...
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
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
      <main className="flex-1 estateline-container py-10 space-y-10">
        {/* Header Title & Pricing Bar */}
        <div className="border-b border-line pb-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={listing.type === "For Rent" ? "sage" : "brass"}>
                  {listing.type}
                </Badge>
                <Badge variant="default">{listing.status}</Badge>
                <span className="text-xs font-mono uppercase text-ink-soft">— {listing.city}</span>
              </div>
              <h1 className="font-fraunces text-3xl sm:text-4xl font-semibold text-ink break-words">
                {listing.address}
              </h1>
              <p className="text-xs font-mono text-ink-soft mt-1">
                ID #{listing.id} · Listed in {listing.city}, Texas
              </p>
            </div>

            <div className="flex flex-wrap items-center lg:justify-end gap-4 sm:gap-6 flex-shrink-0">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-ink-soft">
                  Asking Price
                </span>
                <span className="font-fraunces font-bold text-3xl sm:text-4xl text-brass whitespace-nowrap">
                  {formatPrice(listing.price, listing.type)}
                </span>
              </div>

              {/* Action Bar: PDF Datasheet, Compare, Pre-Approval */}
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-surface hover:bg-bg border border-line rounded-lg text-xs font-medium text-ink flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  title="Download / Print PDF Flyer"
                >
                  <span>📄</span>
                  <span>Print PDF Flyer</span>
                </button>

                <Link href="/compare">
                  <button className="px-3.5 py-2 bg-surface hover:bg-bg border border-line rounded-lg text-xs font-medium text-ink flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs whitespace-nowrap">
                    <span>📊</span>
                    <span>Compare</span>
                  </button>
                </Link>

                <MagneticButton>
                  <button
                    onClick={() => setShowPreApprovalModal(true)}
                    className="px-4 py-2 bg-brass hover:bg-brass-deep text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    Apply Pre-Approval →
                  </button>
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>

        {/* Photo Gallery Grid with Crossfade Transitions */}
        <section className="relative isolate z-0 w-full mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[420px] sm:h-[480px] md:h-[540px] rounded-2xl overflow-hidden">
            {/* Main Large Photo */}
            <div className="md:col-span-2 h-full overflow-hidden rounded-2xl bg-bg relative group border border-line">
              <AnimatePresence mode="wait">
                {listing.images && listing.images.length > 0 ? (
                  <motion.img
                    key={activePhotoIndex}
                    src={getImageUrl(listing.images[activePhotoIndex % listing.images.length].image_url)}
                    alt={`${listing.address} photo ${activePhotoIndex + 1}`}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover object-center cursor-pointer"
                    onClick={() => setShowLightbox(true)}
                  />
                ) : (
                  <motion.div
                    key={activePhotoIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full"
                  >
                    <HouseSVGPlaceholder hue={galleryHues[activePhotoIndex % 3]} className="h-full" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Prev / Next Overlay Arrows on Main Photo */}
              {listing.images && listing.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-brass text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-lg font-bold text-xl"
                    aria-label="Previous Photo"
                  >
                    ‹
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePhotoIndex((prev) => (prev + 1) % listing.images.length);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-brass text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs shadow-lg font-bold text-xl"
                    aria-label="Next Photo"
                  >
                    ›
                  </button>
                </>
              )}

              {/* Expand Fullscreen Button & Photo Counter */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <button
                  onClick={() => setShowLightbox(true)}
                  className="bg-black/70 hover:bg-black/90 backdrop-blur-xs text-white text-xs font-medium px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <span>⛶</span>
                  <span>View Full Photo</span>
                </button>
              </div>

              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs font-medium px-3 py-1.5 rounded-full pointer-events-none shadow-md">
                Photo {(activePhotoIndex % Math.max(1, listing.images?.length || 3)) + 1} of {Math.max(1, listing.images?.length || 3)}
              </div>
            </div>

            {/* Dynamic Side Photo Column - Two equal 50/50 slots */}
            {(() => {
              const totalImgs = listing.images?.length || 0;
              const slot1Index = totalImgs > 1 ? (activePhotoIndex + 1) % totalImgs : 0;
              const slot2Index = totalImgs > 2 ? (activePhotoIndex + 2) % totalImgs : slot1Index;

              return (
                <div className="hidden md:flex flex-col gap-4 h-full min-h-0">
                  {/* Side Slot 1 */}
                  <div
                    onClick={() => totalImgs > 1 && setActivePhotoIndex(slot1Index)}
                    className="flex-1 min-h-0 overflow-hidden rounded-2xl bg-bg relative cursor-pointer group transition-all duration-300 border border-line hover:border-brass shadow-xs hover:shadow-md"
                    title="Click to view this photo in main display"
                  >
                    {listing.images && listing.images.length > slot1Index ? (
                      <img
                        src={getImageUrl(listing.images[slot1Index].image_url)}
                        alt={`${listing.address} photo ${slot1Index + 1}`}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <HouseSVGPlaceholder hue={galleryHues[1]} className="h-full" />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xs">
                      Photo {slot1Index + 1}
                    </div>
                  </div>

                  {/* Side Slot 2 */}
                  <div
                    onClick={() => totalImgs > 2 && setActivePhotoIndex(slot2Index)}
                    className="flex-1 min-h-0 overflow-hidden rounded-2xl bg-bg relative cursor-pointer group transition-all duration-300 border border-line hover:border-brass shadow-xs hover:shadow-md"
                    title="Click to view this photo in main display"
                  >
                    {listing.images && listing.images.length > slot2Index ? (
                      <img
                        src={getImageUrl(listing.images[slot2Index].image_url)}
                        alt={`${listing.address} photo ${slot2Index + 1}`}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <HouseSVGPlaceholder hue={galleryHues[2]} className="h-full" />
                    )}
                    <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-md shadow-xs">
                      Photo {slot2Index + 1}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Bottom Thumbnail Strip for Instant Selection of ALL Photos */}
          {listing.images && listing.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto py-2 scrollbar-none print:hidden">
              {listing.images.map((img, idx) => {
                const isSelected = (activePhotoIndex % listing.images.length) === idx;
                return (
                  <button
                    key={img.id || idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`flex-shrink-0 w-24 h-16 sm:w-28 sm:h-18 rounded-xl overflow-hidden relative cursor-pointer transition-all duration-200 border-2 ${
                      isSelected
                        ? "border-brass ring-2 ring-brass/40 scale-105 shadow-md"
                        : "border-line opacity-70 hover:opacity-100 hover:border-brass"
                    }`}
                  >
                    <img
                      src={getImageUrl(img.image_url)}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1 rounded">
                      {idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* Fullscreen Lightbox Modal */}
        <AnimatePresence>
          {showLightbox && listing.images && listing.images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none"
              onClick={() => setShowLightbox(false)}
            >
              {/* Top Controls Bar */}
              <div className="w-full max-w-6xl flex items-center justify-between z-50 text-white px-2 py-1">
                <span className="text-white/90 text-sm font-mono font-medium">
                  Photo {(activePhotoIndex % listing.images.length) + 1} of {listing.images.length} · {listing.address}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowLightbox(false);
                  }}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-brass text-white text-xl font-bold flex items-center justify-center cursor-pointer transition-all shadow-lg hover:scale-105"
                  aria-label="Close Fullscreen"
                >
                  ✕
                </button>
              </div>

              {/* Main Image Area with Prominent Left/Right Buttons */}
              <div
                className="relative max-w-6xl max-h-[75vh] w-full flex-1 flex items-center justify-center my-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  key={activePhotoIndex}
                  src={getImageUrl(listing.images[activePhotoIndex % listing.images.length].image_url)}
                  alt={`${listing.address} full photo`}
                  className="max-w-full max-h-[72vh] object-contain rounded-xl shadow-2xl transition-all duration-300"
                />

                {listing.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
                      }}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/75 hover:bg-brass border border-white/30 text-white flex items-center justify-center text-3xl font-bold cursor-pointer transition-all shadow-2xl hover:scale-110 z-50 active:scale-95"
                      aria-label="Previous Photo"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhotoIndex((prev) => (prev + 1) % listing.images.length);
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/75 hover:bg-brass border border-white/30 text-white flex items-center justify-center text-3xl font-bold cursor-pointer transition-all shadow-2xl hover:scale-110 z-50 active:scale-95"
                      aria-label="Next Photo"
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              {listing.images.length > 1 && (
                <div
                  className="z-50 max-w-2xl w-full flex items-center justify-center gap-2 overflow-x-auto py-2 px-4 no-scrollbar"
                  onClick={(e) => e.stopPropagation()}
                >
                  {listing.images.map((img, idx) => {
                    const isSelected = (activePhotoIndex % listing.images.length) === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIndex(idx);
                        }}
                        className={`relative w-14 h-10 sm:w-16 sm:h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          isSelected ? "border-brass scale-105 shadow-md" : "border-white/30 opacity-60 hover:opacity-100 hover:border-white"
                        }`}
                      >
                        <img
                          src={getImageUrl(img.image_url)}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Spec Grid & Content Layout */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start pt-4 border-t border-line">
          {/* Main Property Overview */}
          <div className="lg:col-span-2 space-y-10">
            {/* Specs Bar */}
            <Card hoverable={false} className="bg-surface grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-line/60 rounded-2xl">
              <div className="text-center">
                <span className="block text-xs font-medium text-ink-soft">Bedrooms</span>
                <span className="font-fraunces text-2xl font-bold text-ink mt-1">
                  {listing.beds ?? "N/A"}
                </span>
              </div>
              <div className="text-center pl-4">
                <span className="block text-xs font-medium text-ink-soft">Bathrooms</span>
                <span className="font-fraunces text-2xl font-bold text-ink mt-1">
                  {listing.baths ?? "N/A"}
                </span>
              </div>
              <div className="text-center pl-4">
                <span className="block text-xs font-medium text-ink-soft">Interior Sqft</span>
                <span className="font-fraunces text-2xl font-bold text-ink mt-1">
                  {listing.sqft ? listing.sqft.toLocaleString() : "N/A"}
                </span>
              </div>
              <div className="text-center pl-4">
                <span className="block text-xs font-medium text-ink-soft">Lot Acres</span>
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

              <Card hoverable={false} className="p-0 overflow-hidden bg-surface rounded-2xl border border-line">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-bg font-medium text-ink-soft">
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">Event</th>
                      <th className="py-3 px-4 font-semibold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line/60">
                    {listing.price_history && listing.price_history.length > 0 ? (
                      listing.price_history.map((entry) => (
                        <tr key={entry.id} className="hover:bg-bg/50">
                          <td className="py-3 px-4 text-ink-soft font-medium">
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
                        <td colSpan={3} className="py-4 text-center text-xs text-ink-soft">
                          No historical price changes recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Card>
            </div>

            {/* Map Placeholder */}
            <div className="space-y-4 print:hidden">
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
                      className="text-xs font-medium text-brass hover:text-brass-deep transition-colors cursor-pointer"
                    >
                      {showAmortizationTable ? "Hide Amortization Schedule ▲" : "View 30-Year Yearly Amortization Schedule ▼"}
                    </button>

                    <button
                      onClick={() => setShowPreApprovalModal(true)}
                      className="px-3.5 py-1.5 bg-brass hover:bg-brass-deep text-white text-xs font-medium rounded-lg shadow-xs cursor-pointer"
                    >
                      Get Pre-Approved with Preferred Lenders →
                    </button>
                  </div>

                  {/* 30-Year Amortization Breakdown Table */}
                  {showAmortizationTable && (
                    <div className="mt-4 pt-4 border-t border-line overflow-x-auto space-y-2">
                      <span className="text-xs font-semibold text-ink-soft block">30-Year Yearly Amortization Schedule</span>
                      <table className="w-full text-left text-xs font-inter">
                        <thead>
                          <tr className="border-b border-line text-ink-soft font-medium">
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
                                <td className="py-2 text-emerald-700 font-medium">${yearlyP.toLocaleString()}</td>
                                <td className="py-2 text-rose-700 font-medium">${yearlyI.toLocaleString()}</td>
                                <td className="py-2 text-ink-soft">${remBal.toLocaleString()}</td>
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
                  <div className="w-10 h-10 rounded-full bg-brass text-white font-fraunces font-bold text-lg flex items-center justify-center">
                    {listing.agent.user?.full_name?.charAt(0) || "A"}
                  </div>
                  <div>
                    <h3 className="font-fraunces font-semibold text-ink text-base">
                      {listing.agent.user?.full_name || "Agent"}
                    </h3>
                    <span className="block text-xs font-medium text-ink-soft">
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
            <Card hoverable={false} className="bg-surface print:hidden">
              <h3 className="font-fraunces text-lg font-semibold text-ink mb-1">
                Inquire About Property
              </h3>
              <p className="text-xs text-ink-soft mb-4">
                Send a message directly to the listing agent for private viewing schedules.
              </p>

              {leadSuccess ? (
                <div className="p-4 bg-sage-soft border border-sage/30 text-center space-y-2 rounded-xl">
                  <span className="text-brass font-bold text-xl">✓</span>
                  <h4 className="font-fraunces font-semibold text-ink">Inquiry Submitted</h4>
                  <p className="text-xs text-ink-soft">
                    Your message was transmitted to the listing agent.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleLeadSubmit} className="space-y-4">
                  {leadError && (
                    <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-medium rounded-xl">
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

                  <MagneticButton className="w-full">
                    <Button
                      type="submit"
                      variant="brass"
                      className="w-full py-3"
                      disabled={leadSubmitting}
                    >
                      {leadSubmitting ? "Transmitting..." : "Send Inquiry"}
                    </Button>
                  </MagneticButton>
                </form>
              )}
            </Card>
          </div>
        </div>

        {/* Similar Listings Row */}
        {similarListings.length > 0 && (
          <div className="pt-12 border-t border-line space-y-6 print:hidden">
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
                      <div className="h-44 w-full relative mb-3 overflow-hidden rounded-xl bg-bg">
                        {sim.images && sim.images.length > 0 ? (
                          <img
                            src={getImageUrl(sim.images[0].image_url)}
                            alt={sim.address}
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <HouseSVGPlaceholder index={sim.id} hue={sim.hue_color || "var(--sage-soft)"} />
                        )}
                        <div className="absolute top-3 left-3 z-10">
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
        <AnimatePresence>
          {showPreApprovalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPreApprovalModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="bg-surface p-8 rounded-2xl max-w-lg w-full border border-line space-y-5 shadow-2xl relative z-10"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-900 text-xs font-medium rounded-full">
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
                  <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl text-center space-y-3">
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
                      className="w-full py-2.5 bg-ink text-white font-medium text-xs rounded-lg cursor-pointer hover:bg-ink/90 transition-colors"
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
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Full Legal Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Jane Doe"
                        className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Annual Household Income</label>
                        <input
                          type="text"
                          required
                          placeholder="$145,000"
                          className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Credit Score Estimate</label>
                        <select className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15">
                          <option>740+ (Excellent)</option>
                          <option>700-739 (Good)</option>
                          <option>660-699 (Fair)</option>
                          <option>Below 660</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-ink-soft mb-1.5">Preferred Loan Type</label>
                      <select className="w-full px-4 py-2.5 bg-bg border border-line rounded-lg focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15">
                        <option>30-Year Conventional Fixed</option>
                        <option>15-Year Conventional Fixed</option>
                        <option>FHA Loan (3.5% Down)</option>
                        <option>VA Loan (0% Down for Veterans)</option>
                      </select>
                    </div>

                    <MagneticButton className="w-full">
                      <button
                        type="submit"
                        className="w-full py-3 bg-brass hover:bg-brass-deep text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shadow-xs mt-2"
                      >
                        Submit Financial Application →
                      </button>
                    </MagneticButton>
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
