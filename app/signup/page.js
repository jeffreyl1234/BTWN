"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabaseBrowser";

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

  const canSubmit = useMemo(() => {
    return (
      form.fullName.trim() &&
      form.email.trim() &&
      form.password.length >= 8 &&
      form.confirmPassword.length >= 8
    );
  }, [form]);

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
      setError(submitError.message || "Unable to create account.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <p className="pill">Create Account</p>
        <h1>Join BT:WN</h1>
        <p className="muted">
          Create an account to save businesses, write reviews, and list your services.
        </p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label>
            Full Name
            <input
              required
              value={form.fullName}
              onChange={(event) => setField("fullName", event.target.value)}
              placeholder="Your full name"
            />
          </label>

          <label>
            UCLA or preferred email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              required
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) => setField("password", event.target.value)}
              placeholder="At least 8 characters"
            />
          </label>

          <label>
            Confirm Password
            <input
              required
              type="password"
              minLength={8}
              value={form.confirmPassword}
              onChange={(event) =>
                setField("confirmPassword", event.target.value)
              }
              placeholder="Re-enter your password"
            />
          </label>

          <button className="button" disabled={!canSubmit || saving} type="submit">
            {saving ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        <p className="muted auth-footnote">
          Need to add your service listing right away?{" "}
          <Link href="/admin/add-business">Submit your business profile</Link>.
        </p>
      </div>
    </section>
  );
}
