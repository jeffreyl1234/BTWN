"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getSessionState } from "@/lib/authClient";
import { getSupabaseBrowser, isSignupConfigured } from "@/lib/supabaseBrowser";

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const signupConfigured = isSignupConfigured();

  const loadOwnedBusinesses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { user: currentUser, accessToken } = await getSessionState();
      setUser(currentUser);

      if (!currentUser || !accessToken) {
        setBusinesses([]);
        return;
      }

      const res = await fetch("/api/me/businesses", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load businesses.");

      setBusinesses(data.businesses || []);
    } catch (loadError) {
      setError(loadError.message || "Failed to load account details.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOwnedBusinesses();
  }, [loadOwnedBusinesses]);

  useEffect(() => {
    if (!signupConfigured) return;

    const supabase = getSupabaseBrowser();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadOwnedBusinesses();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [signupConfigured, loadOwnedBusinesses]);

  if (!signupConfigured) {
    return (
      <section className="stack page-space">
        <h1>Account</h1>
        <p className="auth-error">
          Supabase auth is not configured. Add public Supabase env vars to use accounts.
        </p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="stack page-space">
        <h1>My Businesses</h1>
        <p className="muted">Loading your account...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="stack page-space">
        <h1>My Businesses</h1>
        <p className="muted">Log in to manage your business listings.</p>
        <div className="row">
          <Link href="/login" className="button">
            Log in
          </Link>
          <Link href="/signup" className="button button-secondary">
            Sign up
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="stack page-space">
      <h1>My Businesses</h1>
      <p className="muted">Signed in as {user.email}</p>
      {error && <p className="auth-error">{error}</p>}
      {!error && businesses.length === 0 && (
        <p className="muted">No businesses tied to this account yet.</p>
      )}

      <div className="grid grid-3">
        {businesses.map((biz) => (
          <article key={biz.id} className="card stack business-card">
            <h3>{biz.name}</h3>
            <p className="muted">
              {biz.category} · {biz.location}
            </p>
            {biz.description && <p>{biz.description}</p>}
            <div className="row wrap">
              <Link href={`/business/${biz.id}`} className="button button-secondary">
                View
              </Link>
              <Link href={`/business/${biz.id}/edit`} className="button">
                Edit
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
