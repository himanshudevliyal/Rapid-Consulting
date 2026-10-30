import { FigmaEnquiryCard } from "@/components/forms/figma-enquiry-card";
import { OfficeMap } from "@/components/ui/office-map";

/**
 * The navy closing panel at the foot of the Figma pages: heading + the office map on the left,
 * a white enquiry card on the right. Pass the same props FigmaEnquiryCard takes via `card`.
 *
 *   <ClosingEnquiryPanel heading="Not sure where to start?" intro="..."
 *     card={{ title: "Get your next steps", source: "hub-finance", pageId: "S04", select: {...} }} />
 */
export function ClosingEnquiryPanel({ id = "closing-enquiry", eyebrow, heading, intro, photoNote, card, className = "" }) {
  return (
    <section id={id} data-component="ClosingEnquiryPanel" className={`bg-[#09263e] py-14 text-white sm:py-20 ${className}`}>
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14">
        <div className="min-w-0">
          {eyebrow && <p className="mb-3! mt-0! text-xs font-bold uppercase tracking-[0.16em] text-[#eaff6b]">{eyebrow}</p>}
          <h2 className="m-0! max-w-none! text-3xl! font-bold! leading-tight! tracking-tight! text-white! sm:text-4xl!">{heading}</h2>
          {intro && <p className="mb-0! mt-4! max-w-xl text-base leading-7 text-white/80">{intro}</p>}
          <OfficeMap className="mt-8 aspect-[16/10] max-w-xl border border-white/15" />
        </div>
        <FigmaEnquiryCard {...card} />
      </div>
    </section>
  );
}

export default ClosingEnquiryPanel;
