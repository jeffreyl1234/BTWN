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

  if (loading) {
    return (
      <section className="stack page-space">
        <h1>Edit Business</h1>
        <p className="muted">Loading business...</p>
      </section>
    );
  }

  if (!authorized) {
    return (
      <section className="stack page-space">
        <h1>Edit Business</h1>
        <p className="auth-error">{error || "Not authorized."}</p>
        <div className="row wrap">
          <Link href="/login" className="button">
            Log in
          </Link>
          <Link href={`/business/${businessId}`} className="button button-secondary">
            Back to Business
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="stack page-space">
      <h1>Edit Business</h1>

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

        <div className="row wrap">
          <button className="button" disabled={saving} type="submit">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href={`/business/${businessId}`} className="button button-secondary">
            Cancel
          </Link>
        </div>
      </form>

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}
    </section>
  );
}
