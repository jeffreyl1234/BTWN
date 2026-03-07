"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionState } from "@/lib/authClient";
import { getSupabaseBrowser, isSignupConfigured } from "@/lib/supabaseBrowser";

const initialState = {
  name: "",
  category: "",
  description: "",
  location: "",
  instagram: "",
  website: "",
  phone: "",
  email: "",
};

export default function AddBusinessPage() {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);

  const signupConfigured = isSignupConfigured();

  useEffect(() => {
    let mounted = true;

    getSessionState().then(({ user }) => {
      if (!mounted) return;
      setSessionUser(user);
    });

    if (!signupConfigured) {
      return () => {
        mounted = false;
      };
    }

    const supabase = getSupabaseBrowser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSessionUser(session?.user || null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [signupConfigured]);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const { accessToken } = await getSessionState();
      if (!accessToken) {
        throw new Error("Log in is required to submit a business.");
      }

      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");

      setMessage("Business saved.");
      setForm(initialState);
    } catch (err) {
      setError(err.message || "Failed to save business.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="stack page-space">
      <h1>Add Business</h1>
      <p className="muted">
        Browsing and contacting businesses does not require an account.
      </p>

      {!signupConfigured && (
        <p className="auth-error">
          Sign in is not configured. Add Supabase public auth env vars in{" "}
          <code>.env.local</code>.
        </p>
      )}

      {!sessionUser && signupConfigured && (
        <>
          <p className="muted">
            Login is required before you can submit a business listing.
          </p>
          <div className="row wrap">
            <Link href="/login" className="button">
              Log in
            </Link>
            <Link href="/signup" className="button button-secondary">
              Create account
            </Link>
          </div>
        </>
      )}

      {sessionUser && (
        <p className="muted">
          Creating as <strong>{sessionUser.email}</strong>. You can edit later in{" "}
          <Link href="/account">My Businesses</Link>.
        </p>
      )}

      {sessionUser && (
        <form className="grid" onSubmit={onSubmit}>
          <div className="grid grid-2">
            <label>
              Name *
              <input
                required
                autoFocus
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Category *
              <input
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </label>
          </div>

          <label>
            Description
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>

          <label>
            Location *
            <input
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </label>

          <div className="grid grid-2">
            <label>
              Instagram URL
              <input
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
              />
            </label>
            <label>
              Website URL
              <input
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </label>
            <label>
              Phone
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </label>
            <label>
              Email
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
          </div>

          <button className="button" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save Business"}
          </button>
        </form>
      )}

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}
    </section>
  );
}
