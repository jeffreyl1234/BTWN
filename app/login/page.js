"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser, isSignupConfigured } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const signupConfigured = isSignupConfigured();

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!signupConfigured) {
        throw new Error("Login is not configured. Add Supabase public env vars.");
      }

      const supabase = getSupabaseBrowser();
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (loginError) throw loginError;
      router.push("/account");
    } catch (submitError) {
      setError(submitError.message || "Unable to log in.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <header className="auth-card__header">
          <p className="pill">Welcome Back</p>
          <h1>Log in</h1>
          <p className="auth-card__subtitle muted">
            Log in to manage and edit your business listings.
          </p>
        </header>

        {!signupConfigured && (
          <div className="auth-alert auth-alert--error" role="alert">
            Login is not configured. Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and a
            public Supabase key in <code>.env.local</code>.
          </div>
        )}

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-label">
            Email
            <input
              required
              type="email"
              className="auth-input"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="auth-label">
            Password
            <input
              required
              type="password"
              className="auth-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Your password"
            />
          </label>

          <button className="button auth-submit" disabled={!signupConfigured || saving} type="submit">
            {saving ? "Logging in..." : "Log in"}
          </button>
        </form>

        {error && (
          <div className="auth-alert auth-alert--error" role="alert">
            {error}
          </div>
        )}

        <p className="muted auth-footnote">
          New here? <Link href="/signup">Create an account</Link>.
        </p>
      </div>
    </section>
  );
}
