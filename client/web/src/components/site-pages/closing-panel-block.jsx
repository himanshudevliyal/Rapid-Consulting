import { ClosingEnquiryPanel } from "@/components/forms/closing-enquiry-panel";
import { asArray, asText, sourceSlug } from "@/lib/content/site-page-adapters";
import { NAV_OFFSET } from "./shared";

// The navy closing panel at the foot of a page: heading, introduction and a
// labelled photo placeholder on the left, a white enquiry card on the right
// (shared ClosingEnquiryPanel / FigmaEnquiryCard: name, mobile, an optional
// choice, district, a free-text line, consent unticked, WhatsApp). The card
// posts to the existing enquiry endpoint. Everything visible is a block field.

export const closingPanelEmpty = (data) => !asText(data.heading) && !asText(data.form_title);

const on = (value, fallback = true) => (value === undefined || value === null || value === "" ? fallback : value === true || value === "true");

export function ClosingPanelBlock({ section, ctx }) {
  const { data } = section;
  const { page, tx } = ctx;
  const options = asArray(data.select_options)
    .map((item) => asText(item?.text))
    .filter(Boolean);
  const selectLabel = asText(data.select_label);
  const fields = [on(data.show_district) && "district", on(data.show_activity) && "activity"].filter(Boolean);
  const title = asText(data.form_title) || asText(data.heading);
  const submit = asText(data.submit_label) || tx("railSubmit", "Get my next steps");

  const card = {
    title,
    hint: asText(data.form_hint) || undefined,
    seal: on(data.show_seal) ? "free" : "none",
    sealLabel: asText(data.badge_text) || tx("freeSeal", "Free first review"),
    source: sourceSlug(asText(data.source)) || sourceSlug(`closing-${page.path}`),
    pageId: page.pageKey || undefined,
    pageTitle: page.h1,
    serviceName: page.title || page.h1,
    select:
      selectLabel && options.length
        ? {
            label: selectLabel,
            required: on(data.select_required, false),
            options,
            placeholder: asText(data.select_placeholder) || tx("railChoose", "Choose one"),
            // A required choice whose first line is worded ("Not sure yet") treats that line as an answer.
            placeholderValue: on(data.select_required, false) && Boolean(asText(data.select_placeholder)),
          }
        : undefined,
    fields,
    placeholders: {
      name: asText(data.name_placeholder) || undefined,
      phone: asText(data.phone_placeholder) || undefined,
      district: asText(data.district_placeholder) || undefined,
      activity: asText(data.activity_placeholder) || undefined,
    },
    labels: {
      required: asText(data.required_label) || undefined,
      name: asText(data.name_label) || tx("railName", "Your name"),
      phone: asText(data.phone_label) || tx("railPhone", "Mobile number"),
      district: asText(data.district_label) || tx("railDistrict", "District"),
      activity: asText(data.activity_label) || tx("railActivity", "What are you working on?"),
      optional: asText(data.optional_label) || tx("railOptional", "optional"),
      consent: asText(data.consent_label) || tx("railConsent", "Rapid may contact me by phone or WhatsApp about this enquiry."),
      consentHelp: tx("railConsentHelp", "Please tick the box so we can contact you."),
      choiceError: tx("railChoiceError", "Please choose one"),
      another: tx("railAnother", "Send another request"),
    },
    submitLabel: submit,
    helper: asText(data.helper) || undefined,
    whatsappLabel: asText(data.whatsapp_label) || tx("railWhatsapp", "Chat with Rapid on WhatsApp"),
  };

  return (
    <ClosingEnquiryPanel
      id={section.anchor}
      className={NAV_OFFSET}
      eyebrow={asText(data.eyebrow) || undefined}
      heading={asText(data.heading) || title}
      intro={asText(data.intro) || undefined}
      photoNote={asText(data.photo_note) || tx("closingPhotoNote", "Placeholder - final photography to be supplied by Rapid")}
      card={card}
    />
  );
}
