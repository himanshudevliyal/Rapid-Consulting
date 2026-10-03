import { Button } from "@/components/ui/button";
import { WhatsAppButton } from "@/components/contact/whatsapp";

// WhatsApp first (primary contact action), then the callback form.
export function ContextActions({ t }) {
  return (
    <div className="actions">
      <WhatsAppButton />
      <Button variant="brandSecondary" asChild>
        <a href="/contact">
          {t("service.discussProject")}
          <span aria-hidden="true">↗</span>
        </a>
      </Button>
    </div>
  );
}
