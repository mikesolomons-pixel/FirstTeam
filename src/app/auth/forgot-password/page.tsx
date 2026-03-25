"use client";

import { useState } from "react";
import Link from "next/link";
import { Factory, ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      }
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-steel-900 via-steel-800 to-steel-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ember-500/20 mb-4">
            <Factory className="w-8 h-8 text-ember-400" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            First Team
          </h1>
          <p className="text-steel-300 mt-2 text-sm">
            One team. Every plant. No walls.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mb-2">
                <Mail className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-warm-900">
                Check your email
              </h2>
              <p className="text-sm text-warm-500">
                We sent a password reset link to{" "}
                <span className="font-medium text-warm-700">{email}</span>.
                Click the link in the email to set a new password.
              </p>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-steel-600 hover:text-steel-800 font-medium transition-colors mt-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-warm-900 mb-2">
                Reset your password
              </h2>
              <p className="text-sm text-warm-500 mb-6">
                Enter your email and we&apos;ll send you a link to reset your
                password.
              </p>

              <form onSubmit={handleReset} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-warm-700 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-warm-300 bg-white px-4 py-2.5 text-warm-900 placeholder-warm-400 focus:border-steel-500 focus:ring-2 focus:ring-steel-500/20 outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-ember-500 hover:bg-ember-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-warm-500">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1 text-steel-600 hover:text-steel-800 font-medium transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
