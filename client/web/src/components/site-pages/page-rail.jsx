import { FigmaEnquiryCard } from "@/components/forms/figma-enquiry-card";
import { asArray, asText, sourceSlug } from "@/lib/content/site-page-adapters";

// The page's own form card for the sticky side rail of rail templates, built
// from the masthead's "Rail form" fields (rail_title, rail_hint, the choice
// field, the free-text label, the button and the line under it). With no
// rail_title the page keeps the standard enquiry panel (see site-page-view).
//
// The card is the shared FigmaEnquiryCard (free-review seal, name, mobile, an
// optional choice, district, a free-text line, consent unticked, WhatsApp).
// It posts to the existing enquiry endpoint; nothing new is invented here.

export const hasRailForm = (masthead) => Boolean(asText(masthead?.data?.rail_title));

export function PageRail({ masthead, page, tx }) {
  const data = masthead.data;
  const options = asArray(data.rail_select_options)
    .map((item) => asText(item?.text))
    .filter(Boolean);
  const selectLabel = asText(data.rail_select_label);
  const wanted = asText(data.rail_select_default);

  const select =
    selectLabel && options.length
      ? {
          label: selectLabel,
          required: true,
          options,
          placeholder: tx("railChoose", "Choose one"),
          defaultValue: options.includes(wanted) ? wanted : "",
        }
      : undefined;

  const siteLabel = asText(data.rail_site_label);
  const submit = asText(data.rail_submit_label) || tx("railSubmit", "Get my next steps");

  return (
    <FigmaEnquiryCard
      title={asText(data.rail_title)}
      hint={asText(data.rail_hint) || undefined}
      seal="free"
      sealLabel={asText(data.rail_badge_text) || tx("freeSeal", "Free first review")}
      source={sourceSlug(`rail-${page.path}`)}
      pageId={page.pageKey || undefined}
      pageTitle={page.h1}
      serviceName={page.title || page.h1}
      select={select}
      fields={siteLabel ? ["district", "site", "activity"] : ["district", "activity"]}
      placeholders={{
        name: asText(data.rail_name_placeholder) || undefined,
        phone: asText(data.rail_phone_placeholder) || undefined,
        district: asText(data.rail_district_placeholder) || undefined,
        site: asText(data.rail_site_placeholder) || undefined,
        activity: asText(data.rail_activity_placeholder) || undefined,
      }}
      labels={{
        required: asText(data.rail_required_label) || undefined,
        name: tx("railName", "Your name"),
        phone: tx("railPhone", "Mobile number"),
        district: tx("railDistrict", "District"),
        site: siteLabel || undefined,
        activity: asText(data.rail_activity_label) || tx("railActivity", "What are you working on?"),
        optional: asText(data.rail_optional_label) || tx("railOptional", "optional"),
        consent: tx("railConsent", "Rapid may contact me by phone or WhatsApp about this enquiry."),
        consentHelp: tx("railConsentHelp", "Please tick the box so we can contact you."),
        choiceError: tx("railChoiceError", "Please choose one"),
        another: tx("railAnother", "Send another request"),
      }}
      submitLabel={submit}
      helper={asText(data.rail_helper) || undefined}
      whatsappLabel={tx("railWhatsapp", "Chat with Rapid on WhatsApp")}
    />
  );
}
