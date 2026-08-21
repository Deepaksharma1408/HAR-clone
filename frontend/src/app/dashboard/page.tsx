"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Textarea } from "@/components/Textarea";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { HouseSVGPlaceholder } from "@/components/HouseSVGPlaceholder";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl, getImageUrl, getAuthHeaders } from "@/lib/config";

interface ListingItem {
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
  images?: { id: number; image_url: string; order: number }[];
}

interface LeadItem {
  id: number;
  listing_id: number;
  listing_address: string;
  listing_city: string;
  name: string;
  phone: string | null;
  message: string;
  created_at: string;
}

export default function AgentDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [myListings, setMyListings] = useState<ListingItem[]>([]);
  const [myLeads, setMyLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form & Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingListingId, setEditingListingId] = useState<number | null>(null);

  // Form Fields State
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [type, setType] = useState("For Sale");
  const [status, setStatus] = useState("active");
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sqft, setSqft] = useState("");
  const [lotSize, setLotSize] = useState("");
  const [description, setDescription] = useState("");
  const [hueColor, setHueColor] = useState("var(--sage-soft)");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Redirect non-agents to home
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "agent") {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    if (!user || user.role !== "agent") return;
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const authHeaders = getAuthHeaders();
      // Fetch my listings
      const listingsRes = await fetch(`${apiUrl}/listings/mine`, {
        headers: { ...authHeaders },
        credentials: "include",
      });
      if (listingsRes.ok) {
        const data = await listingsRes.json();
        setMyListings(data || []);
      }

      // Fetch my leads
      const leadsRes = await fetch(`${apiUrl}/leads/mine`, {
        headers: { ...authHeaders },
        credentials: "include",
      });
      if (leadsRes.ok) {
        const leadsData = await leadsRes.json();
        setMyLeads(leadsData || []);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const resetForm = () => {
    setEditingListingId(null);
    setAddress("");
    setCity("");
    setPrice("");
    setType("For Sale");
    setStatus("active");
    setBeds("");
    setBaths("");
    setSqft("");
    setLotSize("");
    setDescription("");
    setHueColor("var(--sage-soft)");
    setSelectedFiles(null);
    setFormError(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (item: ListingItem) => {
    setEditingListingId(item.id);
    setAddress(item.address);
    setCity(item.city);
    setPrice(item.price.toString());
    setType(item.type);
    setStatus(item.status);
    setBeds(item.beds ? item.beds.toString() : "");
    setBaths(item.baths ? item.baths.toString() : "");
    setSqft(item.sqft ? item.sqft.toString() : "");
    setLotSize(item.lot_size ? item.lot_size.toString() : "");
    setDescription(item.description || "");
    setHueColor(item.hue_color || "var(--sage-soft)");
    setSelectedFiles(null);
    setFormError(null);
    setShowModal(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    const payload = {
      address,
      city,
      price: Number(price),
      type,
      status,
      beds: beds ? Number(beds) : null,
      baths: baths ? Number(baths) : null,
      sqft: sqft ? Number(sqft) : null,
      lot_size: lotSize ? Number(lotSize) : null,
      description: description || null,
      hue_color: hueColor,
    };

    try {
      const apiUrl = getApiUrl();
      const authHeaders = getAuthHeaders();
      let listingId = editingListingId;
      let res;

      if (editingListingId) {
        // PUT update
        res = await fetch(`${apiUrl}/listings/${editingListingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(payload),
          credentials: "include",
        });
      } else {
        // POST create
        res = await fetch(`${apiUrl}/listings`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders },
          body: JSON.stringify(payload),
          credentials: "include",
        });
      }

      if (!res.ok) {
        const errData = await res.json();
        setFormError(errData.detail || "Error saving listing.");
        setFormSubmitting(false);
        return;
      }

      const savedListing: ListingItem = await res.json();
      listingId = savedListing.id;

      // Upload images if selected
      if (selectedFiles && selectedFiles.length > 0 && listingId) {
        const formData = new FormData();
        for (let i = 0; i < selectedFiles.length; i++) {
          formData.append("files", selectedFiles[i]);
        }
        await fetch(`${apiUrl}/listings/${listingId}/images`, {
          method: "POST",
          headers: { ...authHeaders },
          body: formData,
          credentials: "include",
        });
      }

      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error("Error in listing form submission:", err);
      setFormError("Network error processing listing.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (item: ListingItem) => {
    const newStatus = item.status === "active" ? "unpublished" : "active";
    try {
      const apiUrl = getApiUrl();
      const authHeaders = getAuthHeaders();
      const res = await fetch(`${apiUrl}/listings/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status: newStatus }),
        credentials: "include",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error toggling status:", err);
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this listing permanently?")) return;
    try {
      const apiUrl = getApiUrl();
      const authHeaders = getAuthHeaders();
      const res = await fetch(`${apiUrl}/listings/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders },
        credentials: "include",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Error deleting listing:", err);
    }
  };

  const formatPrice = (priceVal: number, typeStr: string) => {
    if (typeStr === "For Rent") return `$${priceVal.toLocaleString()}/mo`;
    return `$${priceVal.toLocaleString()}`;
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <div className="flex-1 flex items-center justify-center text-xs font-mono uppercase text-ink-soft">
          Loading agent control panel...
        </div>
      </div>
    );
  }

  if (!user || user.role !== "agent") return null;

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <main className="flex-1 estateline-container py-10 space-y-12">
        {/* Dashboard Title Header */}
        <div className="border-b border-line pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <EyebrowLabel>Listing Management</EyebrowLabel>
            <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
              Agent Control Panel<span className="text-brass">.</span>
            </h1>
            <p className="text-xs text-ink-soft mt-1">
              Welcome back, {user.full_name}. Manage your published portfolio and incoming inquiries.
            </p>
          </div>

          <Button variant="brass" size="md" onClick={openAddModal}>
            + Add New Listing
          </Button>
        </div>

        {/* Section 1: My Listings Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-line/60 pb-2">
            <h2 className="font-fraunces text-xl font-semibold text-ink">
              My Portfolio ({myListings.length})
            </h2>
            <span className="text-xs text-ink-soft font-medium">
              Active & Unpublished Listings
            </span>
          </div>

          {myListings.length === 0 ? (
            <Card hoverable={false} className="py-16 text-center space-y-3 bg-surface">
              <div className="text-ink-soft text-2xl">🏛</div>
              <h3 className="font-fraunces text-lg font-medium text-ink">No Listings Published</h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                You haven&apos;t added any properties yet. Click &quot;+ Add New Listing&quot; to publish your first property.
              </p>
              <Button variant="brass" size="sm" onClick={openAddModal}>
                + Create First Listing
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((item) => (
                <Card key={item.id} hoverable={false} className="bg-surface flex flex-col justify-between">
                  <div>
                    <div className="h-44 w-full relative mb-3 overflow-hidden rounded-xl bg-bg">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.images[0].image_url)}
                          alt={item.address}
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";
                          }}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <HouseSVGPlaceholder index={item.id} hue={item.hue_color || "var(--sage-soft)"} />
                      )}
                      <div className="absolute top-3 left-3 flex gap-2 z-10">
                        <Badge variant={item.type === "For Rent" ? "sage" : "brass"}>
                          {item.type}
                        </Badge>
                        <Badge variant={item.status === "active" ? "default" : "danger"}>
                          {item.status === "active" ? "Active" : "Unpublished"}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-fraunces text-base font-semibold text-ink truncate">
                      {item.address}
                    </h3>
                    <span className="text-xs font-medium text-ink-soft block mb-1">
                      {item.city}
                    </span>
                    <p className="text-xs text-ink-soft mb-3">
                      {item.beds ? `${item.beds} Beds` : "Commercial"} ·{" "}
                      {item.baths ? `${item.baths} Baths` : ""} ·{" "}
                      {item.sqft ? `${item.sqft.toLocaleString()} sqft` : ""}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-line mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-fraunces font-bold text-base text-brass">
                        {formatPrice(item.price, item.type)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditModal(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => handleDeleteListing(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Customer Leads Inquiries Table */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-line/60 pb-2">
            <h2 className="font-fraunces text-xl font-semibold text-ink">
              Direct Buyer Inquiries ({myLeads.length})
            </h2>
            <span className="text-xs text-ink-soft font-medium">
              Inquiries from Property Detail Pages
            </span>
          </div>

          <Card hoverable={false} className="bg-surface overflow-x-auto p-0">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-line bg-bg/50 text-ink-soft font-medium">
                  <th className="py-3 px-4">Prospect</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Property</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4 text-right">Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {myLeads.length > 0 ? (
                  myLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-bg/30 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-ink">
                        {lead.name}
                      </td>
                      <td className="py-3.5 px-4 text-ink-soft">
                        {lead.phone || "No phone"}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/listings/${lead.listing_id}`}
                          className="text-brass hover:text-brass-deep font-semibold"
                        >
                          {lead.listing_address} ({lead.listing_city})
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 text-ink-soft max-w-xs truncate">
                        &quot;{lead.message}&quot;
                      </td>
                      <td className="py-3.5 px-4 text-right text-ink-soft">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-ink-soft">
                      No customer leads received yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      </main>

      {/* Add / Edit Listing Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface border border-line rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between border-b border-line pb-4 mb-6">
                <h3 className="font-fraunces text-xl font-semibold text-ink">
                  {editingListingId ? "Edit Property Specification" : "Publish New Listing"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-ink-soft hover:text-ink text-lg font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {formError && (
                <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-medium rounded-xl">
                  {formError}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Property Address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="1204 Oak Ridge Lane"
                  />

                  <Input
                    label="City"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Katy, Memorial..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Price ($)"
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="625000"
                  />

                  <Select
                    label="Property Type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    options={[
                      { value: "For Sale", label: "For Sale" },
                      { value: "For Rent", label: "For Rent" },
                      { value: "Luxury Villa", label: "Luxury Villa" },
                      { value: "Penthouse", label: "Skyline Penthouse" },
                      { value: "Farmhouse", label: "Equestrian Farmhouse" },
                      { value: "Commercial", label: "Commercial" },
                    ]}
                  />

                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: "active", label: "Active" },
                      { value: "unpublished", label: "Unpublished" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Input
                    label="Bedrooms"
                    type="number"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    placeholder="4"
                  />

                  <Input
                    label="Bathrooms"
                    type="number"
                    step="0.5"
                    value={baths}
                    onChange={(e) => setBaths(e.target.value)}
                    placeholder="3"
                  />

                  <Input
                    label="Sqft"
                    type="number"
                    value={sqft}
                    onChange={(e) => setSqft(e.target.value)}
                    placeholder="2800"
                  />

                  <Input
                    label="Lot Size (Acres)"
                    type="number"
                    step="0.01"
                    value={lotSize}
                    onChange={(e) => setLotSize(e.target.value)}
                    placeholder="0.25"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Placeholder Color Tint"
                    value={hueColor}
                    onChange={(e) => setHueColor(e.target.value)}
                    options={[
                      { value: "var(--sage-soft)", label: "Sage Soft Tint" },
                      { value: "rgba(184, 134, 46, 0.12)", label: "Brass Gold Tint" },
                      { value: "rgba(22, 35, 28, 0.08)", label: "Forest Charcoal Tint" },
                    ]}
                  />

                  <div>
                    <label className="block text-[13px] font-medium text-ink-soft mb-1.5">
                      Upload Property Photos
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setSelectedFiles(e.target.files)}
                      className="w-full bg-surface text-ink px-3 py-2 text-xs rounded-lg border border-line"
                    />
                  </div>
                </div>

                <Textarea
                  label="Architectural Description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Exquisite mid-century modern home nestled in the heart of Katy..."
                />

                <div className="pt-4 border-t border-line flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="brass"
                    size="sm"
                    disabled={formSubmitting}
                  >
                    {formSubmitting
                      ? "Saving..."
                      : editingListingId
                      ? "Save Changes"
                      : "Publish Listing"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
