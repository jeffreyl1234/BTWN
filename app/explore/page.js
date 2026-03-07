import { Suspense } from "react";
import ExploreClient from "./ExploreClient";

function ExploreFallback() {
  return (
    <section className="explore-page">
      <div className="explore-meta">
        <h1>All Businesses</h1>
        <p className="muted">Loading businesses...</p>
      </div>
    </section>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreFallback />}>
      <ExploreClient />
    </Suspense>
  );
}
