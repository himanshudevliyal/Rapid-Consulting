import { FigmaEnquiryCard } from "@/components/forms/figma-enquiry-card";
import { b2bText } from "@/lib/pages/b2b-text";

// The sticky enquiry rail of a service page. It lives in the page grid's right
// column, so it follows the reader through the article and stops where the
// grid ends (before the full-width sections). Change of Land Use (D060) asks the
// three land questions; every other service uses a short generic review request
// titled with the service's own name.
const CLU_CODE = "D060";

export function ServiceRail({ service, t }) {
  const tx = b2bText(t);
  const name = service.h1 || service.title;
  const source = `service-${service.slug}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60).replace(/-+$/, "");

  const land = service.code === CLU_CODE;
  const card = land
    ? {
        title: tx("rail.clu.title", "Find out if your land will get CLU, before you invest."),
        fields: ["district", "site", "activity"],
        labels: {
          site: tx("rail.clu.site", "Village / khasra"),
          activity: tx("rail.clu.activity", "What you want to build"),
        },
        submitLabel: tx("rail.clu.submit", "Check my land for CLU"),
        helper: tx("rail.clu.helper", "A Rapid expert will call to understand your plot."),
      }
    : {
        title: tx("rail.title", "Get a free first review for {name}.", { name }),
        hint: tx("rail.hint", "Tell us where your project stands. A Rapid expert will call you."),
        fields: ["district", "activity"],
        labels: { activity: tx("rail.activity", "What are you working on?") },
        submitLabel: tx("rail.submit", "Get my first review"),
        helper: tx("rail.helper", "A Rapid expert will call you."),
      };

  return (
    <aside className="b2b-rail" aria-label={tx("rail.label", "Free first review")}>
      <div className="b2b-rail__sticky">
        <FigmaEnquiryCard
          id="service-enquiry"
          source={source || "service-page"}
          pageId={service.code}
          pageTitle={name}
          serviceName={name}
          seal="free"
          sealLabel={tx("rail.seal", "Free first review")}
          whatsapp
          whatsappLabel={tx("rail.whatsapp", "Chat with Rapid on WhatsApp")}
          {...card}
        />
      </div>
    </aside>
  );
}
