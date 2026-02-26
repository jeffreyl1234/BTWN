import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export default async function BusinessDetailPage({ params }) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", id)
    .single();

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
    <section className="stack">
      <h1>{business.name}</h1>
      <p className="muted">
        {business.category} · {business.location}
      </p>
      {business.description && <p>{business.description}</p>}

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
