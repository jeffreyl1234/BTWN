/* Individual review card used on the business detail page */
const ReviewCard = ({ name, date, text, rating = 5 }) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="biz-review">
      <div className="biz-review-avatar" aria-hidden="true">
        {initials}
      </div>
      <div>
        <div className="biz-review-header">
          <span className="biz-review-name">{name}</span>
          <span className="biz-review-date">{date}</span>
        </div>
        <div className="biz-review-stars" aria-label={`${rating} out of 5 stars`}>
          {"★".repeat(rating)}
        </div>
        <p className="biz-review-text">{text}</p>
      </div>
    </div>
  );
};

export default ReviewCard;
