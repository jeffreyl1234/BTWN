import Link from "next/link";

export default function Home() {
  return (
    <section className="stack">
      <h1>BTWN</h1>
      <p>Discover UCLA-area small businesses and contact them directly.</p>
      <div className="row">
        <Link href="/explore" className="button">
          Explore Businesses
        </Link>
        <Link href="/admin/add-business" className="button button-secondary">
          Add Business
        </Link>
      </div>
    </section>
  );
}
