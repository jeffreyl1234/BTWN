"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser, isSignupConfigured } from "@/lib/supabaseBrowser";

/**
 * Global site header.
 * On the home page: logo + nav only (search lives in the hero).
 * On all other pages: logo + inline search bar + nav.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [user, setUser] = useState(null);
  const isHome = pathname === "/";
  const signupConfigured = isSignupConfigured();
  const [ready, setReady] = useState(!signupConfigured);

  useEffect(() => {
    if (!signupConfigured) {
      return;
    }

    const supabase = getSupabaseBrowser();
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user || null);
      setReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user || null);
      setReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [signupConfigured]);

  async function onSignOut() {
    if (!signupConfigured) return;
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  }

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
          <Link href="/explore" className="nav-review-link">Explore</Link>
          <Link href="/admin/add-business" className="nav-add-btn">
            Add Your Business
          </Link>

          {ready && user && (
            <>
              <Link href="/account" className="nav-review-link">My Businesses</Link>
              <button type="button" className="text-button" onClick={onSignOut} style={{ fontSize: '0.82rem' }}>
                Log out
              </button>
            </>
          )}

          {ready && !user && signupConfigured && (
            <>
              <Link href="/login" className="nav-review-link">Log In</Link>
              <Link href="/signup" className="nav-review-link">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
