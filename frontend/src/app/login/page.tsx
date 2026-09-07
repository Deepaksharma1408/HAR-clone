"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { useSearchParams } from "next/navigation";
import { getApiUrl } from "@/lib/config";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser, setUserState } = useAuth();

  const emailParam = searchParams?.get("email") || "";
  const isVerified = searchParams?.get("verified") === "true";
  const isExisting = searchParams?.get("existing") === "true";
  const isReset = searchParams?.get("reset") === "true";

  const [email, setEmail] = useState(emailParam);
  const [password, setPassword] = useState("");
  const [infoMessage] = useState<string | null>(
    isReset
      ? "✅ Password reset successfully! Please sign in with your new password."
      : isVerified
      ? "🎉 Account verified successfully! Please log in below with your email & password."
      : isExisting
      ? "👋 Welcome back! An account with this email already exists. Please enter your password to sign in."
      : null
  );
  const [demoTab, setDemoTab] = useState<"agent" | "buyer">("agent");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Direct login function for form submission & demo buttons
  const executeLogin = async (loginEmail: string, loginPassword: string) => {
    setError(null);
    setLoading(true);
    setEmail(loginEmail);
    setPassword(loginPassword);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        if (data && data.user) {
          setUserState(data.user, data.access_token);
        }
        await refreshUser();
        
        // Redirect Agents to Dashboard and Buyers to Home Page
        if (data?.user?.role === "agent") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      } else {
        setError(data.detail || "Authentication failed. Incorrect email or password.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to authentication services.");
    } finally {
      setLoading(false);
    }
  };

  // Direct login submit handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await executeLogin(email, password);
  };

  const agentAccounts = [
    {
      name: "Rhea Malhotra",
      email: "rhea@estateline.com",
      title: "Buyer's Agent · Katy",
      badge: "10 Katy Listings · 1 Incoming Inquiry",
    },
    {
      name: "Sarah Jenkins",
      email: "sarah@estateline.com",
      title: "Luxury Specialist · Memorial",
      badge: "9 Luxury Listings · 1 Incoming Inquiry",
    },
    {
      name: "David Chen",
      email: "david@estateline.com",
      title: "Commercial & Land · Sugar Land",
      badge: "9 Commercial Properties · 1 Lead",
    },
    {
      name: "Marcus Thompson",
      email: "marcus@estateline.com",
      title: "Listing Specialist · The Heights",
      badge: "8 Heights & Penthouse Listings",
    },
  ];

  const buyerAccounts = [
    {
      name: "Alex Morgan",
      email: "buyer@estateline.com",
      title: "Verified Demo Buyer",
      badge: "4 Saved Favorites · 1 Saved Search Alert · 2 Leads",
    },
    {
      name: "Deepak Sharma",
      email: "deepak@estateline.com",
      title: "Registered Buyer",
      badge: "1 Submitted Commercial Inquiry",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-bg overflow-y-auto">
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 py-8 sm:py-12 my-auto">
        <div className="w-full max-w-xl my-auto">
          <Card hoverable={false} className="w-full max-h-[92vh] overflow-y-auto">
            <div className="text-center mb-6">
              <EyebrowLabel className="mb-2">Portal Access</EyebrowLabel>
              <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
                Welcome back
                <span className="text-brass">.</span>
              </h1>
              <p className="text-xs text-ink-soft mt-2">
                Sign in with demo accounts to view real agent listings or buyer favorites.
              </p>
            </div>

            {/* Quick Demo Sign In Box */}
            <div className="mb-6 p-4 bg-bg-surface border border-line rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <span className="text-[11px] font-bold tracking-wider text-brass uppercase flex items-center gap-1">
                  ⚡ Select Demo Account
                </span>
                
                {/* Role Tabs */}
                <div className="flex bg-bg p-0.5 border border-line rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setDemoTab("agent")}
                    className={`px-3 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                      demoTab === "agent"
                        ? "bg-brass text-white shadow-xs"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    👔 Agent Accounts ({agentAccounts.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemoTab("buyer")}
                    className={`px-3 py-1 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                      demoTab === "buyer"
                        ? "bg-brass text-white shadow-xs"
                        : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    👤 Buyer Accounts ({buyerAccounts.length})
                  </button>
                </div>
              </div>

              {/* Agent Accounts List */}
              {demoTab === "agent" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {agentAccounts.map((agent) => (
                    <button
                      key={agent.email}
                      type="button"
                      onClick={() => executeLogin(agent.email, "password123")}
                      disabled={loading}
                      className="flex flex-col p-3 bg-bg border border-line hover:border-brass rounded-xl text-left transition-all hover:shadow-md group disabled:opacity-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold text-ink group-hover:text-brass transition-colors">
                          {agent.name}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-brass bg-brass/10 px-1.5 py-0.5 rounded">
                          Agent
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-ink-soft truncate w-full">
                        {agent.title}
                      </span>
                      <span className="text-[10px] text-ink-muted truncate w-full mt-0.5">
                        {agent.email}
                      </span>
                      <div className="mt-2 pt-2 border-t border-line/50 flex items-center justify-between w-full">
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 truncate max-w-[170px]">
                          {agent.badge}
                        </span>
                        <span className="text-[10px] font-semibold text-brass group-hover:translate-x-0.5 transition-transform">
                          Login →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Buyer Accounts List */}
              {demoTab === "buyer" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {buyerAccounts.map((buyer) => (
                    <button
                      key={buyer.email}
                      type="button"
                      onClick={() => executeLogin(buyer.email, "password123")}
                      disabled={loading}
                      className="flex flex-col p-3 bg-bg border border-line hover:border-brass rounded-xl text-left transition-all hover:shadow-md group disabled:opacity-50 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-xs font-bold text-ink group-hover:text-brass transition-colors">
                          {buyer.name}
                        </span>
                        <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                          Buyer
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-ink-soft truncate w-full">
                        {buyer.title}
                      </span>
                      <span className="text-[10px] text-ink-muted truncate w-full mt-0.5">
                        {buyer.email}
                      </span>
                      <div className="mt-2 pt-2 border-t border-line/50 flex items-center justify-between w-full">
                        <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60 truncate max-w-[170px]">
                          {buyer.badge}
                        </span>
                        <span className="text-[10px] font-semibold text-brass group-hover:translate-x-0.5 transition-transform">
                          Login →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="pt-2 text-[10px] text-ink-muted text-center italic">
                🔑 Password for all demo accounts: <code className="font-mono not-italic font-bold text-ink bg-bg px-1 py-0.5 rounded border border-line">password123</code>
              </div>
            </div>

            {/* Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line"></div>
              </div>
              <span className="relative bg-bg-card px-3 text-[11px] font-medium text-ink-soft uppercase tracking-wider">
                Or Sign In With Email
              </span>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-danger/10 border border-danger/20 rounded-xl">
                <p className="text-xs text-danger font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Success / Info Banner */}
            {infoMessage && (
              <div className="mb-5 p-3.5 bg-brass/10 border border-brass/30 rounded-xl">
                <p className="text-xs text-ink leading-relaxed font-medium">
                  {infoMessage}
                </p>
              </div>
            )}

            {/* Direct Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                disabled={loading}
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-medium text-ink-soft">
                    Password
                  </label>
                  <Link
                    href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                    className="text-xs text-brass hover:text-brass-deep font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Password"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                variant="brass"
                className="w-full py-3 mt-4 cursor-pointer"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Sign In →"}
              </Button>
            </form>

            <div className="text-center mt-6 pt-5 border-t border-line text-xs text-ink-soft">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-brass hover:text-brass-deep font-semibold">
                Create Account
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-bg flex items-center justify-center text-xs text-ink-soft">Loading Sign In...</div>}>
      <LoginFormContent />
    </React.Suspense>
  );
}
