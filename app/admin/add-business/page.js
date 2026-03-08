"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { isSignupConfigured, getSupabaseBrowser } from "@/lib/supabaseBrowser";
import { getSessionState } from "@/lib/authClient";

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
  const [isError, setIsError] = useState(false);
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
    setIsError(false);

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

      setMessage("Business saved successfully!");
      setForm(initialState);
    } catch (err) {
      setIsError(true);
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  /* Helper to reduce onChange boilerplate */
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div className="add-biz-page">

      {/* Back link — reuses the shared biz-back-link style */}
      <Link href="/explore" className="biz-back-link">
        <span aria-hidden="true">←</span> Back to Explore
      </Link>

      {/* Page heading */}
      <div className="add-biz-heading">
        <h1 className="add-biz-title">Add Your Business</h1>
        <p className="add-biz-subtitle">
          List your services and connect with students in your community.
        </p>
      </div>

      {/* White card matching the business detail and explore card style */}
      <div className="add-biz-card">
        {!sessionUser ? (
          <div className="add-biz-section-first" style={{ textAlign: 'center', padding: '2rem' }}>
            <p className="muted" style={{ marginBottom: '1.5rem' }}>
              Log in to list your business and manage your listings.
            </p>
            <Link href="/login" className="button header-cta">
              Log in to BT:WN
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="add-biz-form" noValidate>
            <div style={{ padding: '0 0 1.5rem 0', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
              <p className="muted" style={{ fontSize: '0.88rem', margin: 0 }}>
                Creating as <strong>{sessionUser.email}</strong>. 
                You can manage this listing in <Link href="/account" style={{ textDecoration: 'underline' }}>My Businesses</Link>.
              </p>
            </div>


          {/* ── Basic info ─────────────────────────────────────────── */}
          <section className="add-biz-section add-biz-section-first" aria-labelledby="basic-info-heading">
            <h2 id="basic-info-heading" className="add-biz-section-title">BASIC INFO</h2>

            <div className="add-biz-row-2">
              <label className="add-biz-label">
                Business Name <span className="add-biz-required" aria-hidden="true">*</span>
                <input
                  className="add-biz-input"
                  required
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Campus Beats DJ"
                />
              </label>
              <label className="add-biz-label">
                Category <span className="add-biz-required" aria-hidden="true">*</span>
                <input
                  className="add-biz-input"
                  required
                  value={form.category}
                  onChange={set("category")}
                  placeholder="e.g. DJing, Photography"
                />
              </label>
            </div>

            <label className="add-biz-label">
              Location <span className="add-biz-required" aria-hidden="true">*</span>
              <input
                className="add-biz-input"
                required
                value={form.location}
                onChange={set("location")}
                placeholder="e.g. Westwood, UCLA Campus"
              />
            </label>

            <label className="add-biz-label">
              Description
              <textarea
                className="add-biz-input add-biz-textarea"
                rows={4}
                value={form.description}
                onChange={set("description")}
                placeholder="Describe your services, specialties, and what makes you stand out..."
              />
            </label>
          </section>

          {/* ── Contact info ───────────────────────────────────────── */}
          <section className="add-biz-section" aria-labelledby="contact-heading">
            <h2 id="contact-heading" className="add-biz-section-title">CONTACT</h2>

            <div className="add-biz-row-2">
              <label className="add-biz-label">
                Email
                <input
                  className="add-biz-input"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                  placeholder="you@example.com"
                />
              </label>
              <label className="add-biz-label">
                Phone
                <input
                  className="add-biz-input"
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="(555) 000-0000"
                />
              </label>
              <label className="add-biz-label">
                Instagram URL
                <input
                  className="add-biz-input"
                  type="url"
                  value={form.instagram}
                  onChange={set("instagram")}
                  placeholder="https://instagram.com/youraccount"
                />
              </label>
              <label className="add-biz-label">
                Website URL
                <input
                  className="add-biz-input"
                  type="url"
                  value={form.website}
                  onChange={set("website")}
                  placeholder="https://yourwebsite.com"
                />
              </label>
            </div>
          </section>


          {/* ── Submit footer ──────────────────────────────────────── */}
          <div className="add-biz-footer">
            {message && (
              <p
                className={`add-biz-message${isError ? " add-biz-message-error" : " add-biz-message-success"}`}
                role={isError ? "alert" : "status"}
              >
                {message}
              </p>
            )}
            <button
              className="add-biz-submit-btn"
              type="submit"
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? "Saving..." : "Save Business"}
            </button>
          </div>

        </form>
        )}
      </div>

    </div>
  );
}
