"use client";

import Link from "next/link";
import { useState } from "react";

const initialState = {
  name: "",
  category: "",
  description: "",
  location: "",
  instagram: "",
  website: "",
  phone: "",
  email: "",
  adminSecret: "",
};

export default function AddBusinessPage() {
  const [form, setForm] = useState(initialState);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save.");

      setMessage("Business saved.");
      setForm(initialState);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="stack">
      <h1>Add Business</h1>
      <p className="muted">
        Browsing and contacting businesses does not require an account.
      </p>
      <p className="muted">
        Want account-based management later?{" "}
        <Link href="/signup" className="text-link-underlined">
          Create an owner account
        </Link>
        .
      </p>

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

        <label>
          Admin secret *
          <input
            required
            type="password"
            value={form.adminSecret}
            onChange={(e) => setForm({ ...form, adminSecret: e.target.value })}
            placeholder="From .env.local ADMIN_SECRET"
          />
        </label>

        <button className="button" disabled={saving} type="submit">
          {saving ? "Saving..." : "Save Business"}
        </button>
      </form>

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}
    </section>
  );
}
