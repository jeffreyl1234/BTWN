"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const categories = [
  "all",
  "beauty",
  "education",
  "entertainment",
  "creative",
  "tech",
];

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBusinesses = useCallback(async (nextQ, nextCategory) => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (nextQ) params.set("q", nextQ);
      if (nextCategory) params.set("category", nextCategory);

      const res = await fetch(`/api/businesses?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");
      setBusinesses(data.businesses || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses("", "all");
  }, [fetchBusinesses]);

  const categoryOptions = ["all", ...new Set(businesses.map((b) => b.category))]
    .filter(Boolean)
    .map((item) => item.toLowerCase());

  return (
    <section className="stack page-space">
      <h1>Explore Businesses</h1>
      <p className="muted">
        Showing real database rows when available, otherwise starter demo data.
      </p>

      <form
        className="row wrap card"
        onSubmit={(e) => {
          e.preventDefault();
          fetchBusinesses(q, category);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or keyword"
        />
        <select
          value={category}
          onChange={(e) => {
            const next = e.target.value;
            setCategory(next);
            fetchBusinesses(q, next);
          }}
        >
          {[...new Set([...categories, ...categoryOptions])].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="button" type="submit">
          Search
        </button>
      </form>

      {loading && <p className="muted">Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && businesses.length === 0 && (
        <p className="muted">No businesses found.</p>
      )}

      <div className="grid grid-2">
        {businesses.map((biz) => (
          <article key={biz.id} className="card stack">
            <div className="row">
              <p className="pill">{biz.category}</p>
              <p className="muted">{biz.location}</p>
            </div>
            <h3>{biz.name}</h3>
            <p className="muted">
              {biz.phone || biz.email || "Contact info on profile"}
            </p>
            {biz.description && <p>{biz.description}</p>}
            <div>
              <Link className="button button-secondary" href={`/business/${biz.id}`}>
                View
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
