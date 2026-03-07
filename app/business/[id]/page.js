import Link from "next/link";
import { getBusinessById } from "@/lib/businessData";
import ReviewCard from "@/components/ReviewCard";

/* Sample reviews — replace with real DB data when reviews table is available */
const SAMPLE_REVIEWS = [
  {
    name: "Emily Chen",
    date: "2 weeks ago",
    text: "Great photographer for graduation photos. Super easy to work with and the photos turned out amazing! Highly recommend.",
    rating: 5,
  },
  {
    name: "Marcus Johnson",
    date: "1 month ago",
    text: "Sarah captured our event perfectly. Professional, creative, and delivered photos quickly. Will definitely hire again!",
    rating: 5,
  },
  {
    name: "Lisa Park",
    date: "2 months ago",
    text: "Beautiful portraits and very affordable. The editing was professional and she was patient with all my requests.",
    rating: 4,
  },
];

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

  /* Derive initials for the avatar placeholder */
  const initials = business.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="biz-detail">
      {/* Back link */}
      <Link href="/explore" className="biz-back-link">
        <span aria-hidden="true">←</span> Back to results
      </Link>

      {/* Hero banner */}
      <div className="biz-banner" role="img" aria-label="Business banner">
        ADD BANNER
      </div>

      {/* Main profile card */}
      <article className="biz-profile-card">

        {/* Header: avatar + name + rating + action buttons */}
        <section className="biz-profile-header" aria-label="Business profile">
          <div className="biz-avatar" aria-hidden="true">{initials}</div>

          <div className="biz-profile-info">
            <h1 className="biz-name">{business.name}</h1>

            <div className="biz-rating">
              <div className="biz-rating-stars" aria-label="5 out of 5 stars">
                ★★★★★
              </div>
              <span>5 (42 reviews)</span>
            </div>

            <div className="biz-actions">
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  className="biz-btn-primary"
                >
                  ✉ Contact
                </a>
              )}
              {business.instagram && (
                <a
                  href={business.instagram}
                  className="biz-btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
              )}
              {business.website && (
                <a
                  href={business.website}
                  className="biz-btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Website
                </a>
              )}
              {business.phone && (
                <a href={`tel:${business.phone}`} className="biz-btn-secondary">
                  {business.phone}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* About */}
        {business.description && (
          <section className="biz-section" aria-labelledby="about-heading">
            <h2 id="about-heading" className="biz-section-title">ABOUT</h2>
            <p className="biz-about-text">{business.description}</p>
          </section>
        )}

        {/* Services */}
        <section className="biz-section biz-section-notop" aria-labelledby="services-heading">
          <h2 id="services-heading" className="biz-section-title">SERVICES</h2>
          <div className="biz-services">
            <span className="biz-service-tag">{business.category}</span>
            {business.location && (
              <span className="biz-service-tag">{business.location}</span>
            )}
          </div>
        </section>

        {/* Portfolio */}
        <section className="biz-section" aria-labelledby="portfolio-heading">
          <h2 id="portfolio-heading" className="biz-section-title">PORTFOLIO</h2>
          <div className="biz-portfolio-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="biz-portfolio-item" aria-label={`Portfolio photo ${n}`}>
                Photo {n}
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="biz-section" aria-labelledby="reviews-heading">
          <h2 id="reviews-heading" className="biz-section-title">REVIEWS</h2>
          <div className="biz-reviews">
            {SAMPLE_REVIEWS.map((review) => (
              <ReviewCard key={review.name} {...review} />
            ))}
          </div>
        </section>

      </article>
    </div>
  );
}
