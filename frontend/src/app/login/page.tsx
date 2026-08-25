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
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Direct login submit handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        if (data && data.user) {
          setUserState(data.user, data.access_token);
        }
        await refreshUser();
        router.push("/");
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

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card hoverable={false} className="w-full">
            <div className="text-center mb-8">
              <EyebrowLabel className="mb-2">Portal Access</EyebrowLabel>
              <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
                Welcome back
                <span className="text-brass">.</span>
              </h1>
              <p className="text-xs text-ink-soft mt-2">
                Sign in to manage your listings or saved properties.
              </p>
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
                className="w-full py-3 mt-4"
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
