"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* Category pills shown in two rows on the landing page */
const CATEGORIES_ROW1 = [
  "DJing",
  "Tutoring",
  "Photography",
  "Fitness",
  "Developers",
  "Design",
  "Engineering",
];

const CATEGORIES_ROW2 = [
  "Language Tutors",
  "Videography",
  "Event Services",
  "Music",
];

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");

  /* Navigate to explore with the typed search query */
  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/explore${q.trim() ? `?${params.toString()}` : ""}`);
  };

  /* Navigate to explore pre-filtered by the selected category */
  const handleCategory = (category) => {
    router.push(`/explore?category=${encodeURIComponent(category.toLowerCase())}`);
  };

  return (
    <div className="home-hero">
      <div className="home-content">

        {/* Hero title */}
        <h1 className="home-title">BT:WN</h1>
        <p className="home-subtitle">
          Discover student talent. Promote your skills. Build your brand.
        </p>

        {/* Search bar — calls /api/businesses via the explore page */}
        <form onSubmit={handleSearch} className="home-search-form" role="search">
          <input
            className="home-search-input"
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search for a service or business..."
            aria-label="Search for a service or business"
          />
          <button type="submit" className="home-search-btn" aria-label="Search">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/button.svg" width={24} height={24} alt="" aria-hidden="true" />
          </button>
        </form>

        {/* Category filter pills — two rows matching the Figma design */}
        <nav className="home-categories" aria-label="Browse by category">
          <div className="home-category-row">
            {CATEGORIES_ROW1.map((cat) => (
              <button
                key={cat}
                type="button"
                className="home-category-pill"
                onClick={() => handleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="home-category-row">
            {CATEGORIES_ROW2.map((cat) => (
              <button
                key={cat}
                type="button"
                className="home-category-pill"
                onClick={() => handleCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </nav>

        {/* Link to full explore page with all categories */}
        <Link href="/explore" className="home-more-btn">
          More Categories →
        </Link>

      </div>
    </div>
  );
}
