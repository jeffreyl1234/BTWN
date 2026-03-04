import Link from "next/link";

export default function Home() {
  return (
    <section className="stack page-space">
      <div className="hero card stack">
        <p className="pill">UCLA Community Directory</p>
        <h1>Discover trusted student-friendly services around campus.</h1>
        <p className="muted">
          BTWN helps students quickly find small businesses for beauty,
          education, creative work, events, and tech help.
        </p>
        <div className="row wrap">
          <Link href="/explore" className="button">
            Explore Businesses
          </Link>
          <Link href="/admin/add-business" className="button button-secondary">
            Add Business
          </Link>
        </div>
      </div>

      <div className="grid grid-3">
        <article className="card stack">
          <h3>Browse fast</h3>
          <p className="muted">Filter by category and quickly compare options.</p>
        </article>
        <article className="card stack">
          <h3>Direct contact</h3>
          <p className="muted">Reach out by Instagram, phone, email, or website.</p>
        </article>
        <article className="card stack">
          <h3>Built for UCLA</h3>
          <p className="muted">Focused on businesses students actually use.</p>
        </article>
      </div>
    </section>
  );
}
