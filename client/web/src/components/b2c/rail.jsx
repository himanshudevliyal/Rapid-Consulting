import { FigmaEnquiryCard } from "@/components/forms/figma-enquiry-card";
import { b2cText } from "./text";

// The right-hand enquiry card of the editorial pages: FigmaEnquiryCard with the
// shared labels translated. Strings are passed in because the card is a client
// component.
export function railLabels(tx) {
  return {
    name: tx("rail.name", "Your name"),
    phone: tx("rail.phone", "Mobile number"),
    district: tx("rail.district", "District"),
    site: tx("rail.site", "Village / khasra"),
    optional: tx("rail.optional", "optional"),
    consent: tx("rail.consent", "I agree that Rapid may call or WhatsApp me about this enquiry."),
    consentHelp: tx("rail.consentHelp", "Please tick the box so we can contact you."),
    choiceError: tx("rail.choiceError", "Please choose one"),
    another: tx("rail.another", "Send another"),
  };
}

/** Project stages offered in "Where's your project?". */
export function stageOptions(tx) {
  return [
    tx("rail.stage.buying", "Buying land"),
    tx("rail.stage.setting", "Setting up a new unit"),
    tx("rail.stage.running", "Running"),
    tx("rail.stage.expanding", "Expanding"),
    tx("rail.stage.stuck", "A file is stuck"),
    tx("rail.stage.unsure", "Not sure yet"),
  ];
}

export function EnquiryRail({
  t,
  title,
  hint,
  source,
  pageId,
  pageTitle,
  serviceName,
  select,
  fields = ["district", "activity"],
  activityLabel,
  siteLabel,
  submitLabel,
  helper,
}) {
  const tx = b2cText(t);
  const labels = { ...railLabels(tx), ...(activityLabel ? { activity: activityLabel } : {}), ...(siteLabel ? { site: siteLabel } : {}) };
  return (
    <FigmaEnquiryCard
      title={title}
      hint={hint}
      seal="free"
      sealLabel={tx("rail.seal", "Free first review")}
      source={source}
      pageId={pageId}
      pageTitle={pageTitle}
      serviceName={serviceName}
      select={select}
      fields={fields}
      labels={labels}
      submitLabel={submitLabel}
      helper={helper ?? tx("rail.helper", "A Rapid expert will call you.")}
      whatsappLabel={tx("rail.whatsapp", "Chat with Rapid on WhatsApp")}
    />
  );
}
