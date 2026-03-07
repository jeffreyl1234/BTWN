import Link from "next/link";
import { getBusinessById } from "@/lib/businessData";
import OwnerActions from "./OwnerActions";

export default async function BusinessDetailPage({ params }) {
  const { id } = await params;
  const business = await getBusinessById(id);

  if (!business) {
    return (
      <section className="stack">
        <h1>Business not found</h1>
        <Link href="/explore" className="button button-secondary">
          Back to Explore
        </Link>
      </section>
    );
  }

  return (
    <section className="stack page-space">
      <h1>{business.name}</h1>
      <p className="muted">
        {business.category} · {business.location}
      </p>
      {business.description && <p>{business.description}</p>}

      <OwnerActions businessId={business.id} ownerId={business.owner_id} />

      <div className="card stack">
        <h3>Contact</h3>
        {business.instagram && <a href={business.instagram}>Instagram</a>}
        {business.website && <a href={business.website}>Website</a>}
        {business.phone && <a href={`tel:${business.phone}`}>{business.phone}</a>}
        {business.email && <a href={`mailto:${business.email}`}>{business.email}</a>}
        {!business.instagram &&
          !business.website &&
          !business.phone &&
          !business.email && <p className="muted">No contact links provided.</p>}
      </div>

      <div>
        <Link href="/explore" className="button button-secondary">
          Back to Explore
        </Link>
      </div>
    </section>
  );
}
