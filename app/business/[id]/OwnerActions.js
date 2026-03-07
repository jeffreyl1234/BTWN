"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSessionState } from "@/lib/authClient";

export default function OwnerActions({ businessId, ownerId }) {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let mounted = true;

    getSessionState().then(({ user }) => {
      if (!mounted) return;
      setUserId(user?.id || null);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!ownerId || !userId || ownerId !== userId) {
    return null;
  }

  return (
    <div className="row wrap">
      <Link href={`/business/${businessId}/edit`} className="button">
        Edit Business
      </Link>
      <Link href="/account" className="button button-secondary">
        My Dashboard
      </Link>
    </div>
  );
}
