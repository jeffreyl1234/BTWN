"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseBrowser, isSignupConfigured } from "@/lib/supabaseBrowser";

export default function SiteHeader() {
  const signupConfigured = isSignupConfigured();
  const [user, setUser] = useState(null);
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
  }

  return (
    <header className="site-header">
      <div className="container row">
        <Link href="/" className="brand">
          BT:WN
        </Link>
        <nav className="row site-nav" aria-label="Primary">
          <Link href="/explore" className="text-link">
            Explore
          </Link>
          <Link href="/admin/add-business" className="button header-cta">
            Add Your Business
          </Link>
          {ready && user && (
            <>
              <Link href="/account" className="text-link">
                My Businesses
              </Link>
              <button type="button" className="text-button" onClick={onSignOut}>
                Log out
              </button>
            </>
          )}
          {ready && !user && signupConfigured && (
            <>
              <Link href="/login" className="text-link">
                Log In
              </Link>
              <Link href="/signup" className="button button-secondary">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
