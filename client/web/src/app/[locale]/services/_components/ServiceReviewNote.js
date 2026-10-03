import { Icon } from "@/components/common/icon";

// Editorial status note for records still under identity review.
export function ServiceReviewNote({ service, t }) {
  if (!service.review_label || service.review_label === "Draft") return null;
  return (
    <aside className="review-note">
      <Icon name="clipboard-text" />
      <p>
        <strong>{t("service.reviewTitle")} · </strong>
        {t("service.reviewText")}
      </p>
    </aside>
  );
}
