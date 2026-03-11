import ExploreClient from "@/app/explore/ExploreClient";
import { Suspense } from "react";

export default function ExplorePage() {
  return (
    <Suspense fallback={<p className="explore-status">Loading businesses...</p>}>
      <ExploreClient />
    </Suspense>
  );
}
