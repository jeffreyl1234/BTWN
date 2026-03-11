"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser, isSignupConfigured } from "@/lib/supabaseBrowser";

function getSafeNextPath(rawNext, fallbackPath) {
  if (!rawNext) return fallbackPath;
  if (!rawNext.startsWith("/") || rawNext.startsWith("//")) return fallbackPath;
  return rawNext;
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const signupConfigured = isSignupConfigured();
  const intent = searchParams.get("intent") === "add-business" ? "add-business" : "review";
  const fallbackNext = intent === "add-business" ? "/admin/add-business" : "/explore?mode=review";
  const nextPath = getSafeNextPath(searchParams.get("next"), fallbackNext);

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      if (!signupConfigured) {
        throw new Error("Login is not configured. Add Supabase public env vars.");
      }

      if (
        intent === "review" &&
        !email.trim().toLowerCase().endsWith("@ucla.edu")
      ) {
        throw new Error("Use a valid @ucla.edu email to write reviews.");
      }

      const supabase = getSupabaseBrowser();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) throw loginError;
      router.push(nextPath);
    } catch (submitError) {
      setError(submitError.message || "Unable to log in.");
    } finally {
      setSaving(false);
    }
  }

  async function onForgotPassword() {
    setError("");
    setMessage("");

    try {
      if (!signupConfigured) {
        throw new Error("Login is not configured.");
      }
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) {
        throw new Error("Enter your email address first.");
      }

      const supabase = getSupabaseBrowser();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/login`
          : undefined;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo }
      );
      if (resetError) throw resetError;

      setMessage("Password reset email sent.");
    } catch (resetError) {
      setError(resetError.message || "Could not send reset email.");
    }
  }

  return (
    <section className="ucla-login-page">
      <div className="ucla-login-shell">
        <header className="ucla-login-hero">
          <div className="ucla-login-mascot" aria-hidden="true">
            🐻
          </div>
          <h1>Sign in with UCLA</h1>
          <p>Only UCLA students can write reviews.</p>
        </header>

        <div className="ucla-login-form-card">
          {!signupConfigured && (
            <div className="auth-alert auth-alert--error" role="alert">
              Login is not configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and a
              public Supabase key in <code>.env.local</code>.
            </div>
          )}

          <form className="ucla-login-form" onSubmit={onSubmit}>
            <label className="ucla-login-label">
              UCLA Email
              <input
                required
                type="email"
                className="ucla-login-input"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={intent === "review" ? "youremail@ucla.edu" : "you@example.com"}
              />
              <span className="ucla-login-helper">
                {intent === "review"
                  ? "Must be a valid @ucla.edu email address."
                  : "Use the email tied to your business owner account."}
              </span>
            </label>

            <label className="ucla-login-label">
              Password
              <input
                required
                type="password"
                className="ucla-login-input"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
              />
            </label>

            <button
              className="ucla-login-submit"
              disabled={!signupConfigured || saving}
              type="submit"
            >
              {saving ? "Signing in..." : "Continue with UCLA"}
            </button>

            <button
              type="button"
              className="ucla-login-forgot"
              onClick={onForgotPassword}
              disabled={!signupConfigured || saving}
            >
              Forgot password?
            </button>
          </form>

          {error && (
            <div className="auth-alert auth-alert--error" role="alert">
              {error}
            </div>
          )}
          {message && (
            <div className="auth-alert auth-alert--success" role="status">
              {message}
            </div>
          )}
        </div>

        <div className="ucla-login-note">
          🔒 We verify UCLA students to maintain authentic reviews from the campus
          community.
        </div>

        <p className="ucla-login-footer">
          Need an account?{" "}
          <Link href={`/signup?intent=${intent}&next=${encodeURIComponent(nextPath)}`}>
            Create one
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="auth-page">
          <p className="muted">Loading login...</p>
        </section>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
