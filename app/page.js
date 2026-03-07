"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const featuredCategories = [
  "DJing",
  "Tutoring",
  "Photography",
  "Fitness",
  "Developers",
  "Design",
  "Engineering",
  "Language Tutors",
  "Videography",
  "Event Services",
  "Music",
];

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const exploreHref = useMemo(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    const serialized = params.toString();
    return serialized ? `/explore?${serialized}` : "/explore";
  }, [query]);

  function onSearchSubmit(event) {
    event.preventDefault();
    router.push(exploreHref);
  }

  return (
    <section className="home-hero">
      <div className="home-hero__center">
        <h1>BT:WN</h1>
        <p>Discover student talent. Promote your skills. Build your brand.</p>

        <form className="home-search" onSubmit={onSearchSubmit}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for a service or business..."
            aria-label="Search for a service or business"
          />
          <button type="submit" aria-label="Search businesses">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M11 4a7 7 0 0 1 5.58 11.22l3.6 3.6-1.42 1.42-3.6-3.6A7 7 0 1 1 11 4Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </form>

        <div className="category-cloud" role="list" aria-label="Popular categories">
          {featuredCategories.map((category) => (
            <Link
              key={category}
              href={`/explore?q=${encodeURIComponent(category)}`}
              className="category-pill"
              role="listitem"
            >
              {category}
            </Link>
          ))}
        </div>

        <Link href="/explore" className="more-categories-btn">
          {"More Categories ->"}
        </Link>
      </div>
    </section>
  );
}
