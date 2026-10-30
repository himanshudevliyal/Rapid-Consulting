import PageContainer from "@/components/layout/page-container";
import SitePageEditor from "./site-page-editor";

export default function SitePageEditPage({ id }) {
  return (
    <PageContainer
      pageTitle={"Edit Site Page"}
      pageDescription={"Compose the page from sections, preview it, then submit it for review or publish it."}
      scrollable
    >
      <SitePageEditor id={id} />
    </PageContainer>
  );
}
