"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { EyebrowLabel } from "@/components/EyebrowLabel";

import { getApiUrl } from "@/lib/config";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  
  // Step 1: Form details
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "agent">("buyer");

  // Step 2: OTP state
  const [otpCode, setOtpCode] = useState("");
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1 Submit: Register and request OTP
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName, role }),
        credentials: "include",
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await res.json();

      if (res.ok) {
        setInfoMessage(data.message || `A 6-digit security OTP code has been sent to ${email}.`);
        setOtpCode(""); // User must type OTP manually for true security
        setStep(2);
      } else {
        setError(data.detail || "Unable to register. Please check your form details.");
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("Register Error:", err);
      if (err.name === "AbortError") {
        setError("Connection timed out. Please check backend server status.");
      } else {
        setError("Unable to connect to authentication services. Ensure API server is reachable.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Step 2 Submit: Verify 6-digit OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/auth/verify-registration-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp_code: otpCode }),
        credentials: "include",
      });

      if (res.ok) {
        setInfoMessage("🎉 Account verified successfully! Redirecting to Login...");
        setTimeout(() => {
          router.push("/login?verified=true");
        }, 1200);
      } else {
        const errorData = await res.json().catch(() => ({ detail: "Verification failed." }));
        setError(errorData.detail || "Invalid or expired OTP code.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error verifying OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setError(null);
    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setInfoMessage(data.message || `A fresh 6-digit OTP has been sent to ${email}.`);
        setOtpCode(""); // User types manually
      } else {
        setError(data.detail || "Unable to resend OTP code.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error resending OTP code.");
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
              <EyebrowLabel className="mb-2">Portal Registration</EyebrowLabel>
              <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
                {step === 1 ? "Create Account" : "Verify Email OTP"}
                <span className="text-brass">.</span>
              </h1>
              <p className="text-xs text-ink-soft mt-2">
                {step === 1
                  ? "Join Estateline to list properties or save listings."
                  : `Enter the 6-digit security OTP sent to ${email}`}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-5 p-3.5 bg-danger/10 border border-danger/20 rounded-xl">
                <p className="text-xs text-danger font-medium">
                  {error}
                </p>
              </div>
            )}

            {/* Success / Info Banner */}
            {infoMessage && step === 2 && (
              <div className="mb-5 p-3.5 bg-brass/10 border border-brass/30 rounded-xl">
                <p className="text-xs text-ink leading-relaxed font-medium">
                  ✉️ {infoMessage}
                </p>
              </div>
            )}

            {/* Step 1: Registration Form */}
            {step === 1 ? (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <Input
                  label="Full Name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rhea Malhotra"
                  disabled={loading}
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rhea@estateline.com"
                  disabled={loading}
                />

                <Input
                  label="Password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  disabled={loading}
                />

                {/* Role Toggle Selector */}
                <div>
                  <label className="block text-[13px] font-medium text-ink-soft mb-2">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole("buyer")}
                      className={`py-2.5 text-xs font-medium border rounded-lg transition-all duration-200 cursor-pointer ${
                        role === "buyer"
                          ? "bg-sage text-white border-sage shadow-xs"
                          : "bg-surface text-ink border-line hover:border-ink"
                      }`}
                      disabled={loading}
                    >
                      Buyer / Seeker
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("agent")}
                      className={`py-2.5 text-xs font-medium border rounded-lg transition-all duration-200 cursor-pointer ${
                        role === "agent"
                          ? "bg-brass text-white border-brass shadow-xs"
                          : "bg-surface text-ink border-line hover:border-ink"
                      }`}
                      disabled={loading}
                    >
                      Listing Agent
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="brass"
                  className="w-full py-3 mt-6"
                  disabled={loading}
                >
                  {loading ? "Sending Verification OTP..." : "Continue with Email OTP →"}
                </Button>
              </form>
            ) : (
              /* Step 2: 6-Digit Email OTP Verification Form */
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-ink-soft mb-2">
                    6-Digit Security Verification OTP
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-bg text-ink text-center tracking-[0.4em] font-mono text-2xl py-3 rounded-xl border border-line focus:outline-none focus:border-brass focus:ring-2 focus:ring-brass/15 transition-all"
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  variant="brass"
                  className="w-full py-3 mt-4"
                  disabled={loading || otpCode.length < 6}
                >
                  {loading ? "Verifying OTP..." : "Verify & Activate Account →"}
                </Button>

                <div className="flex items-center justify-between pt-4 border-t border-line text-xs">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-ink-soft hover:text-ink font-medium cursor-pointer"
                    disabled={loading}
                  >
                    ← Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className="text-brass hover:text-brass-deep font-semibold cursor-pointer"
                    disabled={loading}
                  >
                    Resend Code ↺
                  </button>
                </div>
              </form>
            )}

            <div className="text-center mt-6 pt-5 border-t border-line text-xs text-ink-soft">
              Already have an account?{" "}
              <Link href="/login" className="text-brass hover:text-brass-deep font-semibold">
                Sign In
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
