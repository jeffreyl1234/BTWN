"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

/* Sort options shown in the toolbar — Newest maps to the API default (created_at DESC) */
const SORT_OPTIONS = ["Highest Rated", "Most Reviewed", "Newest"];

export default function ExplorePage() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("Highest Rated");

  /* Fetch from /api/businesses with optional q and category params */
  const fetchBusinesses = useCallback(async (nextQ, nextCategory) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (nextQ) params.set("q", nextQ);
      if (nextCategory && nextCategory !== "all") params.set("category", nextCategory);

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

  /* Read URL params on mount so home page search/category pre-populates this page */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialQ = params.get("q") || "";
    const initialCategory = params.get("category") || "";
    setQ(initialQ);
    setCategory(initialCategory);
    fetchBusinesses(initialQ, initialCategory);
  }, [fetchBusinesses]);

  /* Build the page heading based on active filter */
  const headingCategory = category && category !== "all" ? category : null;
  const headingQuery = q && !headingCategory ? q : null;

  return (
    <div className="explore-page">

      {/* ── Heading + sort controls ── */}
      <section className="explore-header" aria-label="Search results header">
        <h1 className="explore-heading">
          {headingCategory ? (
            <>
              Businesses in{" "}
              <span className="explore-heading-highlight">&quot;{headingCategory}&quot;</span>
            </>
          ) : headingQuery ? (
            <>
              Results for{" "}
              <span className="explore-heading-highlight">&quot;{headingQuery}&quot;</span>
            </>
          ) : (
            "All Businesses"
          )}
        </h1>

        <div className="explore-sort-row" role="toolbar" aria-label="Sort options">
          <span className="explore-sort-label">Sort by:</span>
          <div className="explore-sort-btns">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                className={`explore-sort-btn${sort === option ? " explore-sort-btn-active" : ""}`}
                onClick={() => setSort(option)}
                aria-pressed={sort === option}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Status messages ── */}
      {loading && <p className="explore-status">Loading...</p>}
      {error && <p className="explore-status explore-status-error">{error}</p>}
      {!loading && !error && businesses.length === 0 && (
        <p className="explore-status">No businesses found.</p>
      )}

      {/* ── 2-column business card grid ── */}
      <div className="explore-grid" aria-label="Business listings">
        {businesses.map((biz) => (
          <BusinessCard key={biz.id} biz={biz} />
        ))}
      </div>

    </div>
  );
}

/* ── Business card component ──────────────────────────────────────── */

function BusinessCard({ biz }) {
  const [saved, setSaved] = useState(false);

  /* Build tag list from available business fields */
  const tags = [biz.category, biz.location].filter(Boolean);

  /* Stop card click from triggering when the Save button is clicked */
  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved((prev) => !prev);
  };

  return (
    <article className="biz-card">
      <div className="biz-card-body">

        {/* ── Left: business info ── */}
        <div className="biz-card-info">
          <div className="biz-card-meta">
            <h2 className="biz-card-name">{biz.name}</h2>
          </div>

          {biz.description && (
            <p className="biz-card-description">{biz.description}</p>
          )}

          {/* Category + location tags */}
          <div className="biz-card-tags">
            {tags.map((tag) => (
              <span key={tag} className="biz-card-tag">{tag}</span>
            ))}
          </div>
        </div>

        {/* ── Top-right: Save button ── */}
        <button
          type="button"
          className={`biz-card-save-btn${saved ? " biz-card-save-btn-saved" : ""}`}
          onClick={handleSave}
          aria-label={saved ? "Unsave business" : "Save business"}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Heart1.svg" width={11} height={12} alt="" aria-hidden="true" />
          <span>{saved ? "Saved" : "Save"}</span>
        </button>

      </div>

      {/* View profile link at the bottom of the card */}
      <Link href={`/business/${biz.id}`} className="biz-card-view-link">
        View Profile →
      </Link>
    </article>
  );
}
