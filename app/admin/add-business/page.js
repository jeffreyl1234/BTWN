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
      {sessionUser ? (
        <p className="muted">
          You are creating this listing as <strong>{sessionUser.email}</strong>. You will be
          able to edit it later from <Link href="/account">My Businesses</Link>.
        </p>
      ) : (
        <p className="muted">
          To edit your listing later, <Link href="/login">log in</Link> or{" "}
          <Link href="/signup" className="text-link-underlined">
            create an owner account
          </Link>
          . Login is required before you can submit.
        </p>
      )}

      <form className="grid" onSubmit={onSubmit}>
        <div className="grid grid-2">
          <label>
            Name *
            <input
              required
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

        <button className="button" disabled={saving || !sessionUser} type="submit">
          {saving ? "Saving..." : sessionUser ? "Save Business" : "Log in to Submit"}
        </button>
      </form>

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}
    </section>
  );
}
