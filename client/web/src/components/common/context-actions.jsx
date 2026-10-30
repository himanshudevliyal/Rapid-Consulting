import { WhatsAppButton } from "@/components/contact/whatsapp";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";

// WhatsApp first (primary direct-contact action), then "Discuss your project",
// which opens the shared contextual enquiry drawer (it no longer navigates;
// the dedicated /contact page stays in the menu and the footer).
export function ContextActions({ t, source = "context-actions", serviceName, kind }) {
  return (
    <div className="actions">
      <WhatsAppButton />
      <EnquiryTrigger className="button button-secondary" source={source} serviceName={serviceName} kind={kind}>
        {t("service.discussProject")}
        <span aria-hidden="true">↗</span>
      </EnquiryTrigger>
    </div>
  );
}
