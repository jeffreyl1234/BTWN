"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSessionState } from "@/lib/authClient";

const initialForm = {
  name: "",
  category: "",
  description: "",
  location: "",
  instagram: "",
  website: "",
  phone: "",
  email: "",
};

export default function EditBusinessPage() {
  const params = useParams();
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const businessId = params?.id;

  useEffect(() => {
    let mounted = true;

    async function loadBusiness() {
      setLoading(true);
      setError("");

      try {
        const [{ user }, bizRes] = await Promise.all([
          getSessionState(),
          fetch(`/api/businesses/${businessId}`),
        ]);

        const bizData = await bizRes.json();
        if (!bizRes.ok) {
          throw new Error(bizData.error || "Failed to load business.");
        }

        if (!user) {
          throw new Error("Please log in to edit this business.");
        }

        const business = bizData.business;
        if (!business.owner_id) {
          throw new Error(
            "This listing is not linked to an owner account yet. Contact admin to claim it."
          );
        }

        if (business.owner_id !== user.id) {
          throw new Error("You are not authorized to edit this business.");
        }

        if (!mounted) return;

        setAuthorized(true);
        setForm({
          name: business.name || "",
          category: business.category || "",
          description: business.description || "",
          location: business.location || "",
          instagram: business.instagram || "",
          website: business.website || "",
          phone: business.phone || "",
          email: business.email || "",
        });
      } catch (loadError) {
        if (!mounted) return;
        setError(loadError.message || "Failed to load business.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (businessId) {
      loadBusiness();
    }

    return () => {
      mounted = false;
    };
  }, [businessId]);

  async function onSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const { accessToken } = await getSessionState();
      if (!accessToken) {
        throw new Error("Please log in to save changes.");
      }

      const res = await fetch(`/api/businesses/${businessId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update business.");

      setMessage("Business updated.");
      router.refresh();
    } catch (submitError) {
      setError(submitError.message || "Failed to update business.");
    } finally {
      setSaving(false);
    }
  }

  /* Helper to reduce onChange boilerplate */
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (loading) {
    return (
      <div className="add-biz-page">
        <div className="add-biz-heading">
          <h1 className="add-biz-title">Edit Business</h1>
          <p className="add-biz-subtitle">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="add-biz-page">
        {/* Back link */}
        <Link href={`/business/${businessId}`} className="biz-back-link">
          <span aria-hidden="true">←</span> Back to Business
        </Link>

        <div className="add-biz-heading">
          <h1 className="add-biz-title">Not Authorized</h1>
          <p className="add-biz-subtitle" style={{ color: '#b91c1c' }}>
            {error || "You are not authorized to edit this business."}
          </p>
        </div>

        <div className="add-biz-card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p className="muted" style={{ marginBottom: '1.5rem' }}>
            Please log in with the owner account to make changes.
          </p>
          <Link href="/login" className="button header-cta">
            Log in to BT:WN
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="add-biz-page">
      {/* Back link */}
      <Link href={`/business/${businessId}`} className="biz-back-link">
        <span aria-hidden="true">←</span> Back to Business
      </Link>

      {/* Page heading */}
      <div className="add-biz-heading">
        <h1 className="add-biz-title">Edit Your Business</h1>
        <p className="add-biz-subtitle">
          Update your listing details to keep your information current.
        </p>
      </div>

      <div className="add-biz-card">
        <form onSubmit={onSubmit} className="add-biz-form" noValidate>
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
                placeholder="Describe your services..."
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
              <p className="add-biz-message add-biz-message-success" role="status">
                {message}
              </p>
            )}
            {error && (
              <p className="add-biz-message add-biz-message-error" role="alert">
                {error}
              </p>
            )}
            <div className="row wrap">
              <button
                className="add-biz-submit-btn"
                type="submit"
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <Link href={`/business/${businessId}`} className="button button-secondary">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
