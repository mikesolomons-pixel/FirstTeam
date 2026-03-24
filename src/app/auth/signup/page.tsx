"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Factory } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const COMMON_PLANTS = [
  "Automotive Assembly",
  "Body Shop",
  "Paint Shop",
  "Stamping Plant",
  "Powertrain",
  "Engine Plant",
  "Transmission Plant",
  "Battery Plant",
  "Distribution Center",
  "Quality Lab",
  "R&D Center",
  "Corporate Office",
  "Other",
];

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [plantName, setPlantName] = useState("");
  const [customPlant, setCustomPlant] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const resolvedPlant = plantName === "Other" ? customPlant : plantName;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          plant_name: resolvedPlant,
          role,
          full_name: fullName,
        })
        .eq("id", data.user.id);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }
    }

    router.push("/");
  };

  const inputClasses =
    "w-full rounded-lg border border-warm-300 bg-white px-4 py-2.5 text-warm-900 placeholder-warm-400 focus:border-steel-500 focus:ring-2 focus:ring-steel-500/20 outline-none transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-steel-900 via-steel-800 to-steel-950 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ember-500/20 mb-4">
            <Factory className="w-8 h-8 text-ember-400" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            First Team
          </h1>
          <p className="text-steel-300 mt-2 text-sm">
            Join the team. Every plant. No walls.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-lg font-semibold text-warm-900 mb-6">
            Create your account
          </h2>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-warm-700 mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClasses}
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-warm-700 mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-warm-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                placeholder="At least 6 characters"
              />
            </div>

            <div>
              <label htmlFor="plantName" className="block text-sm font-medium text-warm-700 mb-1.5">
                Plant / Location
              </label>
              <select
                id="plantName"
                required
                value={plantName}
                onChange={(e) => setPlantName(e.target.value)}
                className={inputClasses}
              >
                <option value="" disabled>
                  Select your plant
                </option>
                {COMMON_PLANTS.map((plant) => (
                  <option key={plant} value={plant}>
                    {plant}
                  </option>
                ))}
              </select>
              {plantName === "Other" && (
                <input
                  type="text"
                  required
                  value={customPlant}
                  onChange={(e) => setCustomPlant(e.target.value)}
                  className={`mt-2 ${inputClasses}`}
                  placeholder="Enter plant name"
                />
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-warm-700 mb-1.5">
                Role / Title
              </label>
              <input
                id="role"
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputClasses}
                placeholder="e.g. Plant Manager, Ops Lead"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ember-500 hover:bg-ember-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              {loading ? "Creating account..." : "Join First Team"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-warm-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-steel-600 hover:text-steel-800 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
