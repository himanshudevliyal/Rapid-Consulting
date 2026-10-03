import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Html } from "./html";
import { Icon } from "./icon";

// One content-card owner for service cards (related services, family pages,
// the services directory). Keeps the prototype's .content-card markup.
export function ContentCard({ item, href, typeLabel, actionLabel, englishTag, copyHtml, variant = "standard" }) {
  return (
    <Card
      as="article"
      className={`content-card content-card-${variant}`}
      data-component="ContentCard"
      data-content-id={item.code}
      data-card-variant={variant}
    >
      <div className="content-card-top">
        <Icon name={item.icon || "file-text"} />
        <Badge variant="eyebrow" className="content-card-type">
          {typeLabel}
          {englishTag}
        </Badge>
      </div>
      <h3 className="content-card-title">
        <Link href={href}>{item.title}</Link>
      </h3>
      {variant !== "compact" &&
        (copyHtml ? (
          <Html html={copyHtml} className="content-card-description" />
        ) : (
          <p className="content-card-description">{item.short_description}</p>
        ))}
      <Link className="content-card-link" href={href}>
        {actionLabel}
        <span aria-hidden="true">↗</span>
      </Link>
    </Card>
  );
}
