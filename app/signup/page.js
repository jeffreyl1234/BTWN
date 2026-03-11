"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabaseBrowser, isSignupConfigured } from "@/lib/supabaseBrowser";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function getSafeNextPath(rawNext) {
  if (!rawNext) return "/account";
  if (!rawNext.startsWith("/") || rawNext.startsWith("//")) return "/account";
  return rawNext;
}

function SignUpPageContent() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const signupConfigured = isSignupConfigured();
  const intent = searchParams.get("intent") === "review" ? "review" : "add-business";
  const nextPath = getSafeNextPath(searchParams.get("next"));
  const isReviewSignup = intent === "review";

  const canSubmit = useMemo(() => {
    return (
      signupConfigured &&
      form.fullName.trim() &&
      form.email.trim() &&
      (!isReviewSignup || form.email.trim().toLowerCase().endsWith("@ucla.edu")) &&
      form.password.length >= 8 &&
      form.confirmPassword.length >= 8 &&
      form.password === form.confirmPassword
    );
  }, [form, isReviewSignup, signupConfigured]);

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const email = form.email.trim().toLowerCase();
      const fullName = form.fullName.trim();

      if (!fullName) throw new Error("Full name is required.");
      if (!email) throw new Error("Email is required.");
      if (isReviewSignup && !email.endsWith("@ucla.edu")) {
        throw new Error("Use a valid @ucla.edu email to create a review account.");
      }
      if (form.password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const supabase = getSupabaseBrowser();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}${nextPath}`
          : undefined;

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) throw signUpError;

      setMessage(
        "Account created. Check your email to verify your account, then log in to manage your businesses."
      );
      setForm(initialForm);
    } catch (submitError) {
      const msg = submitError.message || "Unable to create account.";
      const isNetworkError =
        msg === "Failed to fetch" ||
        msg.toLowerCase().includes("failed to fetch") ||
        msg.toLowerCase().includes("network");
      setError(
        isNetworkError
          ? "Couldn’t reach Supabase. Verify your .env.local values and restart the dev server."
          : msg
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <header className="auth-card__header">
          <p className="pill">Create Account</p>
          <h1>Join BT:WN</h1>
          <p className="auth-card__subtitle muted">
            Create an owner account to add and edit your business listings.
          </p>
        </header>

        {!signupConfigured && (
          <div className="auth-alert auth-alert--error" role="alert">
            Sign up is not configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and a
            public Supabase key to <code>.env.local</code>, then restart dev server.
          </div>
        )}

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-label">
            Full Name
            <input
              required
              className="auth-input"
              value={form.fullName}
              onChange={(event) => setField("fullName", event.target.value)}
              placeholder="Your full name"
            />
          </label>

          <label className="auth-label">
            Email
            <input
              required
              type="email"
              className="auth-input"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              placeholder={isReviewSignup ? "youremail@ucla.edu" : "you@example.com"}
            />
            {isReviewSignup && (
              <span className="muted" style={{ fontSize: "0.8rem" }}>
                Must be a valid @ucla.edu email address.
              </span>
            )}
          </label>

          <label className="auth-label">
            Password
            <input
              required
              type="password"
              minLength={8}
              className="auth-input"
              value={form.password}
              onChange={(event) => setField("password", event.target.value)}
              placeholder="At least 8 characters"
            />
          </label>

          <label className="auth-label">
            Confirm Password
            <input
              required
              type="password"
              minLength={8}
              className="auth-input"
              value={form.confirmPassword}
              onChange={(event) => setField("confirmPassword", event.target.value)}
              placeholder="Re-enter your password"
            />
          </label>

          <button className="button auth-submit" disabled={!canSubmit || saving} type="submit">
            {saving ? "Creating Account..." : "Create Account"}
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

        <p className="muted auth-footnote">
          Already have an account? <Link href={`/login?intent=${intent}&next=${encodeURIComponent(nextPath)}`}>Log in</Link>. You can browse and
          contact businesses without an account.
        </p>
      </div>
    </section>
  );
}

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <section className="auth-page">
          <p className="muted">Loading sign up...</p>
        </section>
      }
    >
      <SignUpPageContent />
    </Suspense>
  );
}
