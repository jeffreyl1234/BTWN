"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Global site header.
 * On the home page: logo + nav only (search lives in the hero).
 * On all other pages: logo + inline search bar + nav.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  const isHome = pathname === "/";

  /* Navigate to explore with the typed query */
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/explore${q.trim() ? `?${params.toString()}` : ""}`);
  };

  return (
    <header className="site-header">
      <div className="container row header-inner">
        {/* Brand logo */}
        <Link href="/" className="brand">BT:WN</Link>

        {/* Inline search bar — shown on every page except the home hero */}
        {!isHome && (
          <form
            onSubmit={handleSearch}
            className="header-search-form"
            role="search"
          >
            <input
              className="header-search-input"
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for a service or business..."
              aria-label="Search for a service or business"
            />
            <button type="submit" className="header-search-btn" aria-label="Search">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/button.svg" width={20} height={20} alt="" aria-hidden="true" />
            </button>
          </form>
        )}

        {/* Right-side nav actions */}
        <nav className="nav-actions row" aria-label="Site navigation">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Heart.svg" width={14} height={14} alt="" aria-hidden="true" />
          <Link href="/explore" className="nav-review-link">Write a Review</Link>
          <Link href="/admin/add-business" className="nav-add-btn">
            Add Your Business
          </Link>
        </nav>
      </div>
    </header>
  );
}
