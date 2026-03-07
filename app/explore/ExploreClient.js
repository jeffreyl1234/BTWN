"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const defaultCategories = [
  "all",
  "beauty",
  "education",
  "entertainment",
  "creative",
  "tech",
];

function normalizeCategory(value) {
  return (value || "all").trim().toLowerCase();
}

export default function ExploreClient() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fetchIdRef = useRef(0);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const qParam = (searchParams.get("q") || "").trim();
  const categoryParam = normalizeCategory(searchParams.get("category"));

  const fetchBusinesses = useCallback(async (nextQ, nextCategory) => {
    const thisId = ++fetchIdRef.current;
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (nextQ.trim()) params.set("q", nextQ.trim());
      if (nextCategory && nextCategory !== "all") {
        params.set("category", nextCategory);
      }

      const res = await fetch(`/api/businesses?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed.");

      if (thisId !== fetchIdRef.current) return;
      setBusinesses(data.businesses || []);
    } catch (err) {
      if (thisId !== fetchIdRef.current) return;
      setError(err.message || "Failed to fetch businesses.");
    } finally {
      if (thisId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    setQ(qParam);
    setCategory(categoryParam);
    fetchBusinesses(qParam, categoryParam);
  }, [fetchBusinesses, qParam, categoryParam]);

  const categoryOptions = useMemo(() => {
    const options = businesses
      .map((item) => normalizeCategory(item.category))
      .filter(Boolean);
    return [...new Set(["all", ...defaultCategories, ...options])];
  }, [businesses]);

  function updateUrl(nextQ, nextCategory) {
    const params = new URLSearchParams();
    if (nextQ.trim()) params.set("q", nextQ.trim());
    if (nextCategory && nextCategory !== "all") {
      params.set("category", nextCategory);
    }

    const serialized = params.toString();
    const href = serialized ? `${pathname}?${serialized}` : pathname;
    router.replace(href, { scroll: false });
  }

  function runSearch(nextQ, nextCategory) {
    const normalizedQ = nextQ.trim();
    const normalizedCategory = normalizeCategory(nextCategory);
    const sameQuery = normalizedQ === qParam;
    const sameCategory = normalizedCategory === categoryParam;

    if (sameQuery && sameCategory) {
      fetchBusinesses(normalizedQ, normalizedCategory);
      return;
    }

    updateUrl(normalizedQ, normalizedCategory);
  }

  return (
    <section className="explore-page">
      <form
        className="explore-search"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch(q, category);
        }}
      >
        <div className="explore-search__field">
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search by service, business, category, or location..."
            aria-label="Search businesses"
          />
          <button type="submit" aria-label="Search businesses">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M11 4a7 7 0 0 1 5.58 11.22l3.6 3.6-1.42 1.42-3.6-3.6A7 7 0 1 1 11 4Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>

        <label className="explore-select">
          <span>Category</span>
          <select
            value={category}
            onChange={(event) => {
              const nextCategory = normalizeCategory(event.target.value);
              setCategory(nextCategory);
              runSearch(q, nextCategory);
            }}
          >
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </form>

      <div className="explore-meta">
        <h1>All Businesses</h1>
        <p className="muted">
          {loading
            ? "Loading businesses..."
            : `${businesses.length} result${businesses.length === 1 ? "" : "s"}`}
        </p>
      </div>

      {error && <p className="auth-error">{error}</p>}
      {!loading && !error && businesses.length === 0 && (
        <p className="muted">No businesses found. Try a different search.</p>
      )}

      <div className="grid grid-3 explore-grid">
        {businesses.map((biz) => (
          <Link
            key={biz.id}
            href={`/business/${biz.id}`}
            className="explore-card-link"
            aria-label={`Open ${biz.name}`}
          >
            <article className="card stack business-card explore-card">
              <div className="row">
                <p className="pill">{biz.category}</p>
                <p className="muted">{biz.location}</p>
              </div>
              <h3>{biz.name}</h3>
              {biz.description && <p className="muted">{biz.description}</p>}
              <p className="explore-card__contact muted">
                {biz.phone || biz.email || "Contact info on profile"}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
