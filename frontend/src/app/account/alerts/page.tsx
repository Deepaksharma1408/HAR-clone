"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { useAuth } from "@/context/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface SavedAlertItem {
  id: number;
  name: string;
  filters: {
    type?: string;
    min_price?: number;
    max_price?: number;
    min_beds?: number;
    city?: string;
  };
  created_at: string;
}

interface MatchCountMap {
  [alertId: number]: number;
}

function AlertsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  // Create Form State (Pre-filled from URL parameters if redirected from /listings)
  const [alertName, setAlertName] = useState(searchParams.get("name") || "");
  const [filterType, setFilterType] = useState(searchParams.get("type") || "");
  const [filterMaxPrice, setFilterMaxPrice] = useState(searchParams.get("max_price") || "");
  const [filterMinBeds, setFilterMinBeds] = useState(searchParams.get("min_beds") || "");
  const [filterCity, setFilterCity] = useState(searchParams.get("city") || "");

  const [alerts, setAlerts] = useState<SavedAlertItem[]>([]);
  const [matchCounts, setMatchCounts] = useState<MatchCountMap>({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/alerts`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        const data: SavedAlertItem[] = await res.json();
        setAlerts(data || []);
        
        // Fetch match counts for each alert asynchronously
        data.forEach(async (a) => {
          try {
            const matchRes = await fetch(`${API_URL}/alerts/${a.id}/matches`, {
              credentials: "include",
            });
            if (matchRes.ok) {
              const matchData = await matchRes.json();
              setMatchCounts((prev) => ({ ...prev, [a.id]: matchData.match_count }));
            }
          } catch (err) {
            console.error(err);
          }
        });
      }
    } catch (err) {
      console.error("Error loading alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [user]);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertName.trim()) {
      setError("Please provide a name for this alert.");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const payload = {
        name: alertName,
        filters: {
          type: filterType || null,
          max_price: filterMaxPrice ? Number(filterMaxPrice) : null,
          min_beds: filterMinBeds ? Number(filterMinBeds) : null,
          city: filterCity || null,
        },
      };

      const res = await fetch(`${API_URL}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (res.ok) {
        setAlertName("");
        fetchAlerts();
      } else {
        const errData = await res.json();
        setError(errData.detail || "Unable to save search alert.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error creating search alert.");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/alerts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Error deleting alert:", err);
    }
  };

  const formatFilterSummary = (filters: SavedAlertItem["filters"]) => {
    const parts: string[] = [];
    if (filters.type) parts.push(filters.type);
    if (filters.max_price) parts.push(`Under $${filters.max_price.toLocaleString()}`);
    if (filters.min_beds) parts.push(`${filters.min_beds}+ beds`);
    if (filters.city) parts.push(filters.city);
    return parts.length > 0 ? parts.join(" · ") : "All Listings";
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <div className="flex-1 flex items-center justify-center text-xs font-mono uppercase text-ink-soft">
          Authenticating alert profile...
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="estateline-container py-12 space-y-10">
      {/* Title Header */}
      <div className="border-b border-line pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <EyebrowLabel>Buyer Advisory</EyebrowLabel>
          <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
            Saved Search Alerts<span className="text-brass">.</span>
          </h1>
        </div>
        <span className="text-xs text-ink-soft font-medium">
          Hourly Automated Email Scans
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Create Alert Form */}
        <Card hoverable={false} className="bg-surface">
          <h3 className="font-fraunces text-lg font-semibold text-ink mb-1">
            Save New Search Alert
          </h3>
          <p className="text-xs text-ink-soft mb-4">
            Receive hourly console notifications whenever new matching properties hit the market.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 text-danger text-xs font-medium rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateAlert} className="space-y-4">
            <Input
              label="Alert Label Name"
              required
              value={alertName}
              onChange={(e) => setAlertName(e.target.value)}
              placeholder="e.g. Katy 3+ Bed Family Homes"
              disabled={creating}
            />

            <Input
              label="City / Location"
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
              placeholder="Katy, Memorial..."
              disabled={creating}
            />

            <Select
              label="Property Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              options={[
                { value: "", label: "All Types" },
                { value: "For Sale", label: "For Sale" },
                { value: "For Rent", label: "For Rent" },
                { value: "Commercial", label: "Commercial" },
              ]}
              disabled={creating}
            />

            <Select
              label="Maximum Budget"
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(e.target.value)}
              options={[
                { value: "", label: "No Limit" },
                { value: "500000", label: "Under $500,000" },
                { value: "1000000", label: "Under $1,000,000" },
                { value: "3000000", label: "Under $3,000,000" },
                { value: "5000000", label: "Under $5,000,000" },
              ]}
              disabled={creating}
            />

            <Select
              label="Minimum Bedrooms"
              value={filterMinBeds}
              onChange={(e) => setFilterMinBeds(e.target.value)}
              options={[
                { value: "", label: "Any Bedrooms" },
                { value: "1", label: "1+ Bedrooms" },
                { value: "2", label: "2+ Bedrooms" },
                { value: "3", label: "3+ Bedrooms" },
                { value: "4", label: "4+ Bedrooms" },
              ]}
              disabled={creating}
            />

            <Button
              type="submit"
              variant="brass"
              className="w-full py-3"
              disabled={creating}
            >
              {creating ? "Saving Alert..." : "Create Search Alert"}
            </Button>
          </form>
        </Card>

        {/* Existing Alerts Cards List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between text-xs font-medium text-ink-soft border-b border-line pb-2">
            <span>Configured Alerts ({alerts.length})</span>
            <span className="text-brass">Hourly Job Active</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-ink-soft">
              Loading active search monitors...
            </div>
          ) : alerts.length === 0 ? (
            <Card hoverable={false} className="py-16 text-center space-y-3 bg-surface">
              <div className="text-ink-soft text-2xl">🔔</div>
              <h3 className="font-fraunces text-lg font-medium text-ink">No Saved Alerts</h3>
              <p className="text-xs text-ink-soft max-w-sm mx-auto">
                Create a search monitor above or click &quot;Save this search&quot; on the properties page.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((item) => {
                const count = matchCounts[item.id] ?? 0;
                return (
                  <Card key={item.id} hoverable={false} className="bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-fraunces text-lg font-semibold text-ink">
                          {item.name}
                        </h4>
                        <Badge variant="brass">{count} Matches</Badge>
                      </div>
                      <p className="text-xs text-ink-soft font-medium">
                        {formatFilterSummary(item.filters)}
                      </p>
                      <span className="text-[11px] text-ink-soft/70 block">
                        Saved on {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/listings?city=${item.filters.city || ""}&type=${item.filters.type || ""}&max_price=${item.filters.max_price || ""}&min_beds=${item.filters.min_beds || ""}`}>
                        <Button variant="outline" size="sm">
                          View Results →
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAlert(item.id)}
                        className="text-danger hover:bg-danger/10"
                      >
                        Delete
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountAlertsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <main className="flex-1">
        <Suspense fallback={<div className="py-20 text-center text-xs text-ink-soft">Loading alert engine...</div>}>
          <AlertsContent />
        </Suspense>
      </main>
    </div>
  );
}
