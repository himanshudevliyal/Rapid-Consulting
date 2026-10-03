import { getPage, getSummaries } from "@/lib/pages/content";
import {
  industryCatalogue,
  industryItems,
  industryArchiveHref,
} from "@/lib/pages/industry-catalogue";
import {
  industryServiceBlocks,
  unwrapServiceLink,
} from "@/lib/pages/industry-services";
import { ContentCard } from "./content-card";
import { Html } from "./content-primitives";
export function IndustryServices({ section, page, t, has }) {
  if (page.type === "industry") {
    const catalogue = industryCatalogue.find((r) => r.id === page.id);
    if (!catalogue) return <Html html={section.html} />;
    return (
      <div
        className="industry-service-groups industry-discovery"
        data-component="IndustryServices"
      >
        <Html html={section.html} />
        {["schemes", "services"].map((kind) => (
          <div
            className="industry-discovery-group"
            data-industry-group={kind}
            key={kind}
          >
            <h3>
              {kind === "schemes"
                ? t("site.industryServices.schemes")
                : t("site.industryServices.services")}
            </h3>
            {kind === "schemes" && (
              <p className="industry-discovery-note">
                {catalogue.note[page.locale]}
              </p>
            )}
            <div className="industry-discovery-grid">
              {industryItems(getSummaries(page.locale), page.id, kind)
                .slice(0, 3)
                .map((item) => (
                  <ContentCard
                    key={item.id}
                    page={item}
                    locale={page.locale}
                    t={t}
                    has={has}
                  />
                ))}
            </div>
            <a
              className="button button-secondary industry-archive-link"
              href={industryArchiveHref(page.id, kind, page.locale)}
            >
              {kind === "schemes"
                ? t("site.industryServices.viewSchemes")
                : t("site.industryServices.viewServices")}
              {page.locale === "hi" ? t("common.englishSuffix") : ""}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        ))}
      </div>
    );
  }
  const resolve = (id) => getPage(id, page.locale) || getPage(id, "en");
  const blocks = industryServiceBlocks(section, (id) =>
    ["service", "service-family", "additional-service"].includes(
      resolve(id)?.type || "",
    ),
  );
  // Adjacent single-service paragraphs share one grid. Shared explanations and
  // source subheadings precede their own service group without being duplicated.
  const groups = [];
  for (const block of blocks) {
    if (
      block.serviceIds.length === 1 &&
      groups.at(-1)?.every((b) => b.serviceIds.length === 1)
    )
      groups.at(-1).push(block);
    else groups.push([block]);
  }
  return (
    <div className="industry-service-groups" data-component="IndustryServices">
      {groups.map((group, i) => {
        const single = group.every((b) => b.serviceIds.length === 1);
        return (
          <div key={i} className="industry-service-group">
            {!single && <Html html={group[0].html} />}
            {group.some((b) => b.serviceIds.length > 0) && (
              <div className="card-grid columns-2">
                {group.flatMap((block) =>
                  block.serviceIds.map((id) => {
                    const service = resolve(id);
                    return (
                      <ContentCard
                        key={id}
                        page={service}
                        locale={page.locale}
                        t={t}
                        has={has}
                        copy={
                          single
                            ? { html: unwrapServiceLink(block.html, id) }
                            : undefined
                        }
                      />
                    );
                  }),
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
