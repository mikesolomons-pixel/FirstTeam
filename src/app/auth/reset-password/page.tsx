"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Factory, ArrowLeft, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Supabase automatically exchanges the token from the URL hash
    // and establishes a session. We listen for the PASSWORD_RECOVERY event.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Also check if there's already a session (user clicked link and session was restored)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Redirect to dashboard after a brief delay
    setTimeout(() => router.push("/"), 2000);
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
          {success ? (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 mb-2">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-warm-900">
                Password updated
              </h2>
              <p className="text-sm text-warm-500">
                Your password has been reset. Redirecting you to the dashboard...
              </p>
            </div>
          ) : !ready ? (
            <div className="text-center space-y-4">
              <div className="w-8 h-8 border-4 border-steel-200 border-t-steel-600 rounded-full animate-spin mx-auto" />
              <p className="text-sm text-warm-500">
                Verifying your reset link...
              </p>
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center gap-1 text-sm text-steel-600 hover:text-steel-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Request a new link
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-warm-900 mb-2">
                Set a new password
              </h2>
              <p className="text-sm text-warm-500 mb-6">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleReset} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-warm-700 mb-1.5"
                  >
                    New Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-warm-300 bg-white px-4 py-2.5 text-warm-900 placeholder-warm-400 focus:border-steel-500 focus:ring-2 focus:ring-steel-500/20 outline-none transition"
                    placeholder="At least 6 characters"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirm"
                    className="block text-sm font-medium text-warm-700 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full rounded-lg border border-warm-300 bg-white px-4 py-2.5 text-warm-900 placeholder-warm-400 focus:border-steel-500 focus:ring-2 focus:ring-steel-500/20 outline-none transition"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-ember-500 hover:bg-ember-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
