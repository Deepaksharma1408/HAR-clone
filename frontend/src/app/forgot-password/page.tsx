"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { EyebrowLabel } from "@/components/EyebrowLabel";
import { getApiUrl } from "@/lib/config";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams?.get("email") || "";

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(initialEmail);
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP code
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();

      if (res.ok) {
        setInfoMessage(data.message || `A 6-digit password reset OTP has been sent to ${email}.`);
        setStep(2);
      } else {
        setError(data.detail || "Unable to find an account associated with this email.");
      }
    } catch (err) {
      console.error(err);
      setError("Unable to connect to authentication services.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please verify.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp_code: otpCode.trim(),
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/login?email=${encodeURIComponent(email)}&reset=true`);
      } else {
        setError(data.detail || "Invalid or expired verification code.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (res.ok) {
        setInfoMessage(`A fresh 6-digit OTP code has been re-sent to ${email}.`);
      } else {
        setError(data.detail || "Could not resend code.");
      }
    } catch {
      setError("Could not resend code.");
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
              <EyebrowLabel className="mb-2">Security Recovery</EyebrowLabel>
              <h1 className="font-fraunces text-3xl font-semibold text-ink mt-1">
                {step === 1 ? "Reset Password" : "Set New Password"}
                <span className="text-brass">.</span>
              </h1>
              <p className="text-xs text-ink-soft mt-2">
                {step === 1
                  ? "Enter your registered email address to receive a password reset code."
                  : `Enter the 6-digit verification code sent to ${email} and your new password.`}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-danger/10 border border-danger/20 rounded-xl">
                <p className="text-xs text-danger font-medium">{error}</p>
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

            {step === 1 ? (
              /* Step 1: Email Form */
              <form onSubmit={handleRequestOtp} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your account email"
                  disabled={loading}
                />

                <Button
                  type="submit"
                  variant="brass"
                  className="w-full py-3 mt-4"
                  disabled={loading}
                >
                  {loading ? "Sending Reset Code..." : "Send Reset Code →"}
                </Button>
              </form>
            ) : (
              /* Step 2: OTP + New Password Form */
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Input
                  label="6-Digit Verification Code"
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit OTP"
                  disabled={loading}
                  className="font-mono text-center tracking-widest text-lg"
                />

                <Input
                  label="New Password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  disabled={loading}
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  disabled={loading}
                />

                <Button
                  type="submit"
                  variant="brass"
                  className="w-full py-3 mt-4"
                  disabled={loading}
                >
                  {loading ? "Updating Password..." : "Reset Password →"}
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-xs text-brass hover:text-brass-deep font-medium transition-colors"
                  >
                    Didn&apos;t receive code? Resend OTP
                  </button>
                </div>
              </form>
            )}

            <div className="text-center mt-6 pt-5 border-t border-line text-xs text-ink-soft">
              Remember your password?{" "}
              <Link
                href={`/login${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-brass hover:text-brass-deep font-semibold"
              >
                Sign In
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-bg flex items-center justify-center text-xs text-ink-soft">
          Loading...
        </div>
      }
    >
      <ForgotPasswordContent />
    </React.Suspense>
  );
}
