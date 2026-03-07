"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getSupabaseBrowser, isSignupConfigured } from "@/lib/supabaseBrowser";

const initialForm = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function SignUpPage() {
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const signupConfigured = isSignupConfigured();

  const canSubmit = useMemo(() => {
    return (
      signupConfigured &&
      form.fullName.trim() &&
      form.email.trim() &&
      form.password.length >= 8 &&
      form.confirmPassword.length >= 8 &&
      form.password === form.confirmPassword
    );
  }, [form, signupConfigured]);

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
      if (form.password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }
      if (form.password !== form.confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const supabase = getSupabaseBrowser();
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/explore`
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
        "Account created. Check your email to verify your account, then sign in."
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
          ? "Couldn’t reach Supabase. Check that NEXT_PUBLIC_SUPABASE_URL in .env.local is your real project URL (Supabase → Settings → API → Project URL), not the placeholder, then restart the dev server."
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
            Create an owner account for managing your business listing.
          </p>
        </header>

        {!signupConfigured && (
          <div className="auth-alert auth-alert--error" role="alert">
            Sign up is not configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (or{" "}
            <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code>) to{" "}
            <code>.env.local</code>, then restart the dev server. See README for details.
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
            UCLA or preferred email
            <input
              required
              type="email"
              className="auth-input"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              placeholder="you@example.com"
            />
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
              onChange={(event) =>
                setField("confirmPassword", event.target.value)
              }
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
          You can still browse and contact businesses without an account.{" "}
          <Link href="/admin/add-business">Back to add business</Link>.
        </p>
      </div>
    </section>
  );
}
