"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { getApiUrl } from "@/lib/config";

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

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/agents`);
        if (res.ok) {
          const data = await res.json();
          setAgents(data || []);
        }
      } catch (err) {
        console.error("Error loading agents:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, []);

  const featuredAgents = agents.slice(0, 4);
  const allAgents = agents;

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <Header />

      <main className="flex-1 estateline-container py-12 space-y-16">

        {/* ── FEATURED 4 AGENTS ── */}
        <section>
          <div className="mb-10 border-b border-line pb-4 text-center max-w-2xl mx-auto">
            <EyebrowLabel>Top Advisors</EyebrowLabel>
            <h1 className="font-fraunces text-4xl font-semibold text-ink mt-1">
              Agent Directory<span className="text-brass">.</span>
            </h1>
            <p className="text-xs text-ink-soft mt-2">
              Work with elite architectural specialists representing premier properties across Katy, Memorial, Sugar Land, and The Heights.
            </p>
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs font-mono uppercase text-ink-soft">
              Querying advisory network...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredAgents.map((agent) => (
                <Link key={agent.id} href={`/agents/${agent.id}`}>
                  <Card className="h-full flex flex-col justify-between group">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-[2px] bg-sage-soft text-sage flex items-center justify-center font-fraunces font-bold text-xl group-hover:bg-brass group-hover:text-white transition-colors">
                          {agent.user.full_name.charAt(0)}
                        </div>
                        <Badge variant="brass">Licensed Agent</Badge>
                      </div>

                      <h3 className="font-fraunces text-lg font-semibold text-ink group-hover:text-brass transition-colors">
                        {agent.user.full_name}
                      </h3>
                      <span className="block text-xs font-mono uppercase text-ink-soft mt-1">
                        {agent.role_title || "Licensed Real Estate Agent · Estateline"}
                      </span>

                      <p className="text-xs text-ink-soft mt-3 leading-relaxed line-clamp-4">
                        {agent.bio || "A professional agent ready to help you find your dream home."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-line mt-6 flex items-center justify-between text-xs font-mono uppercase text-brass font-medium">
                      <span>View Profile</span>
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── ALL AGENTS LIST ── */}
        {!loading && allAgents.length > 0 && (
          <section>
            <div className="mb-6 flex items-end justify-between border-b border-line pb-3">
              <div>
                <EyebrowLabel>Full Directory</EyebrowLabel>
                <h2 className="font-fraunces text-2xl font-semibold text-ink mt-1">
                  All Agents<span className="text-brass">.</span>
                </h2>
              </div>
              <span className="text-xs font-mono text-ink-soft uppercase">{allAgents.length} advisors</span>
            </div>

            <div className="divide-y divide-line border border-line rounded-[8px] overflow-hidden bg-surface">
              {allAgents.map((agent, idx) => (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="flex items-center gap-5 px-5 py-4 hover:bg-bg transition-colors group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-brass/10 text-brass flex items-center justify-center font-fraunces font-bold text-base flex-shrink-0 group-hover:bg-brass group-hover:text-white transition-colors">
                    {agent.user.full_name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <span className="block font-inter font-bold text-sm text-ink group-hover:text-brass transition-colors truncate">
                      {agent.user.full_name}
                    </span>
                    <span className="block text-[11px] font-mono uppercase text-ink-soft truncate">
                      {agent.role_title || "Licensed Real Estate Agent · Estateline"}
                    </span>
                  </div>

                  {/* Rank */}
                  <span className="text-xs font-mono text-ink-soft/50 flex-shrink-0 hidden sm:block">
                    #{String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Arrow */}
                  <span className="text-brass text-sm group-hover:translate-x-1 transition-transform flex-shrink-0">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
