import { ContactExperience } from "@/components/form/contact-experience";
import { asText, sourceSlug } from "@/lib/content/site-page-adapters";
import { BlockShell } from "./shared";

// The page's one closing form (full width). preset_kind picks the enquiry or
// the contact form; preset_stage preselects a stage (matched against the
// page's stage chooser when it has one) so the enquiry carries that context.
export function EnquiryFormBlock({ section, ctx }) {
  const data = section.data;
  const { page, tx, t } = ctx;
  const heading = asText(data.heading) || t("contact.heading");
  const intro = asText(data.intro);
  const kind = data.preset_kind === "contact" ? "contact" : "enquiry";

  const wanted = sourceSlug(asText(data.preset_stage));
  const stage = wanted ? ctx.stages.find((entry) => entry.key === wanted) : null;
  const serviceName = kind === "enquiry" ? stage?.title || asText(data.preset_stage) || undefined : undefined;

  return (
    <BlockShell section={section} ctx={ctx} ariaLabel={heading} bare className="py-10 md:py-14">
      <div className="container mx-auto max-w-7xl px-4">
        <ContactExperience
          variant="section"
          kind={kind}
          pageTitle={page.h1}
          pageId={page.pageKey || undefined}
          heading={heading}
          eyebrow={tx("formEyebrow", t("contact.eyebrow"))}
          description={intro ? <p>{intro}</p> : undefined}
          source={wanted ? sourceSlug(`stage-${wanted}`) : "page-closing-form"}
          serviceName={serviceName}
        />
      </div>
    </BlockShell>
  );
}

export const enquiryFormEmpty = () => false;
