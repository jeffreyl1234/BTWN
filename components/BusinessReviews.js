"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSessionState } from "@/lib/authClient";
import ReviewCard from "@/components/ReviewCard";

function formatDate(isoString) {
  const createdAt = new Date(isoString);
  if (Number.isNaN(createdAt.getTime())) return "recently";

  const deltaMs = Date.now() - createdAt.getTime();
  const deltaDays = Math.floor(deltaMs / (1000 * 60 * 60 * 24));

  if (deltaDays <= 0) return "today";
  if (deltaDays === 1) return "1 day ago";
  if (deltaDays < 7) return `${deltaDays} days ago`;
  if (deltaDays < 30) return `${Math.floor(deltaDays / 7)} week${Math.floor(deltaDays / 7) === 1 ? "" : "s"} ago`;
  return `${Math.floor(deltaDays / 30)} month${Math.floor(deltaDays / 30) === 1 ? "" : "s"} ago`;
}

function getStorageKey(businessId) {
  return `btwn-reviews:${businessId}`;
}

export default function BusinessReviews({ businessId, businessName, initialReviews, reviewMode }) {
  const [reviews, setReviews] = useState(() => {
    const fallback = initialReviews || [];
    if (typeof window === "undefined") return fallback;

    const raw = window.localStorage.getItem(getStorageKey(businessId));
    if (!raw) return fallback;

    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
    } catch {
      return fallback;
    }
  });
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [body, setBody] = useState("");
  const [rating, setRating] = useState(5);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isUclaUser = Boolean(user?.email?.toLowerCase().endsWith("@ucla.edu"));

  useEffect(() => {
    let mounted = true;

    getSessionState().then(({ user: sessionUser }) => {
      if (!mounted) return;
      setUser(sessionUser);
      setLoadingUser(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!user) {
      setError("Please log in first.");
      return;
    }

    if (!user.email?.toLowerCase().endsWith("@ucla.edu")) {
      setError("Only @ucla.edu accounts can submit reviews.");
      return;
    }

    const text = body.trim();
    if (!text) {
      setError("Review text is required.");
      return;
    }

    const nextReview = {
      name: user.email.split("@")[0],
      date: "today",
      text,
      rating: Number(rating) || 5,
      created_at: new Date().toISOString(),
    };

    const nextReviews = [nextReview, ...reviews];
    setReviews(nextReviews);
    setBody("");
    setRating(5);
    setMessage(`Review posted for ${businessName}.`);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(getStorageKey(businessId), JSON.stringify(nextReviews));
    }
  }

  return (
    <div className="stack">
      {reviewMode && (
        <p className="biz-review-mode-banner">
          You are in review mode. Submit your review below.
        </p>
      )}

      {loadingUser ? (
        <p className="muted">Checking login state...</p>
      ) : !user ? (
        <div className="biz-review-login">
          <p className="muted">Sign in to write a review for this business.</p>
          <Link
            href={`/login?intent=review&next=${encodeURIComponent(`/business/${businessId}?review=1`)}`}
            className="button"
          >
            Sign in to review
          </Link>
        </div>
      ) : !isUclaUser ? (
        <div className="biz-review-login">
          <p className="muted">
            Reviews require a UCLA account. You are signed in as {user.email}.
          </p>
          <Link
            href={`/login?intent=review&next=${encodeURIComponent(`/business/${businessId}?review=1`)}`}
            className="button"
          >
            Switch to UCLA account
          </Link>
        </div>
      ) : (
        <form className="biz-review-form" onSubmit={onSubmit}>
          <label>
            Rating
            <select value={rating} onChange={(event) => setRating(Number(event.target.value))}>
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Good</option>
              <option value={3}>3 - Okay</option>
              <option value={2}>2 - Poor</option>
              <option value={1}>1 - Bad</option>
            </select>
          </label>

          <label>
            Your review
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              placeholder="Share your experience."
              rows={4}
            />
          </label>

          <button type="submit" className="button">
            Post Review
          </button>
        </form>
      )}

      {error && <p className="auth-error">{error}</p>}
      {message && <p className="auth-success">{message}</p>}

      <div className="biz-reviews">
        {reviews.map((review, index) => (
          <ReviewCard
            key={`${review.name}-${review.created_at || review.date || index}`}
            name={review.name}
            date={review.created_at ? formatDate(review.created_at) : review.date}
            text={review.text}
            rating={review.rating}
          />
        ))}
      </div>
    </div>
  );
}
