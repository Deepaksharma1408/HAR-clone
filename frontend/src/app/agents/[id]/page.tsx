"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { HouseSVGPlaceholder } from "@/components/HouseSVGPlaceholder";

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
}

interface AgentDetail {
  id: number;
  role_title: string;
  bio: string | null;
  user: {
    id: number;
    full_name: string;
    email: string;
  };
  listings: ListingItem[];
}

export default function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const agentId = resolvedParams.id;

  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/agents/${agentId}`);
        if (res.ok) {
          const data = await res.json();
          setAgent(data);
        }
      } catch (err) {
        console.error("Error loading agent profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [agentId]);

  const formatPrice = (price: number, type: string) => {
    if (type === "For Rent") return `$${price.toLocaleString()}/mo`;
    return `$${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center text-xs font-mono uppercase text-ink-soft">
          Loading agent profile...
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col min-h-screen bg-bg">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <Card hoverable={false} className="max-w-md py-12">
            <h1 className="font-fraunces text-2xl font-semibold text-ink">Agent Not Found</h1>
            <p className="text-xs text-ink-soft mt-2 mb-6">
              The requested agent profile could not be located.
            </p>
            <Link href="/agents">
              <Button variant="brass" size="sm">Back to Agent Directory</Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Header />

      <main className="flex-1 estateline-container py-12 space-y-12">
        {/* Agent Profile Header Header */}
        <Card hoverable={false} className="bg-surface p-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-20 h-20 rounded-[2px] bg-brass text-white font-fraunces font-bold text-3xl flex items-center justify-center">
              {agent.user.full_name.charAt(0)}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="font-fraunces text-3xl font-semibold text-ink">
                  {agent.user.full_name}
                </h1>
                <Badge variant="brass">Verified Representative</Badge>
              </div>
              <span className="block text-xs font-mono uppercase text-brass font-medium">
                {agent.role_title}
              </span>
              <span className="block text-xs font-mono text-ink-soft">
                Contact: {agent.user.email}
              </span>
            </div>

            {/* Static Badges */}
            <div className="flex flex-wrap gap-2 pt-2 md:pt-0">
              <Badge variant="sage">Top Producer</Badge>
              <Badge variant="default">Architectural Certified</Badge>
            </div>
          </div>

          {/* Bio */}
          {agent.bio && (
            <div className="mt-6 pt-6 border-t border-line">
              <EyebrowLabel className="mb-2">Professional Biography</EyebrowLabel>
              <p className="text-sm text-ink-soft leading-relaxed max-w-3xl">
                {agent.bio}
              </p>
            </div>
          )}
        </Card>

        {/* Active Published Listings Section */}
        <div className="space-y-6">
          <div className="flex items-end justify-between border-b border-line pb-4">
            <div>
              <EyebrowLabel>Published Portfolio</EyebrowLabel>
              <h2 className="font-fraunces text-2xl font-semibold text-ink mt-1">
                Listings Represented by {agent.user.full_name}<span className="text-brass">.</span>
              </h2>
            </div>
            <span className="text-xs font-mono text-ink-soft">
              {agent.listings.length} Active {agent.listings.length === 1 ? "Property" : "Properties"}
            </span>
          </div>

          {agent.listings.length === 0 ? (
            <Card hoverable={false} className="py-12 text-center text-xs font-mono text-ink-soft">
              This agent has no active properties listed currently.
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {agent.listings.map((item) => (
                <Link key={item.id} href={`/listings/${item.id}`}>
                  <Card className="h-full flex flex-col justify-between group">
                    <div>
                      <div className="h-44 w-full relative mb-3">
                        <HouseSVGPlaceholder hue={item.hue_color || "var(--sage-soft)"} />
                        <div className="absolute top-3 left-3">
                          <Badge variant={item.type === "For Rent" ? "sage" : "brass"}>
                            {item.type}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono uppercase text-ink-soft">{item.city}</span>
                        <Badge variant="default">{item.status}</Badge>
                      </div>

                      <h3 className="font-fraunces text-base font-semibold text-ink group-hover:text-brass transition-colors truncate">
                        {item.address}
                      </h3>

                      <p className="text-xs text-ink-soft mt-1 mb-3">
                        {item.beds ? `${item.beds} Beds` : "Commercial"} ·{" "}
                        {item.baths ? `${item.baths} Baths` : ""}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-line mt-auto">
                      <span className="font-fraunces font-bold text-base text-brass">
                        {formatPrice(item.price, item.type)}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-ink group-hover:translate-x-1 transition-transform">
                        Details →
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
