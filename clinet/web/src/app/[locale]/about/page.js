import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { mainSiteHref } from "@/lib/site";
import { TrustedSection } from "./__components/trusted-section";
import { TeamSection } from "./__components/team-section";
import { AdvantageSection } from "./__components/advantage-section";

export default function Aboutus(params) {
    return(
        <>
      <Breadcrumbs
  heading="About"
  label="About Us"
  items={[
    { label: "Home", href: "/" },
    { label: "About Us", href: "/about" },
  ]}
/>

<TrustedSection></TrustedSection>
<AdvantageSection></AdvantageSection>
<TeamSection></TeamSection>

        </>
    )
}