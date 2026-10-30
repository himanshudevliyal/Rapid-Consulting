import PageContainer from "@/components/layout/page-container";
import SitePageCreateForm from "./site-page-create-form";

export default function SitePageCreatePage() {
  return (
    <PageContainer
      pageTitle={"Create Site Page"}
      pageDescription={"Choose a template, a language and an address. You add the sections in the editor."}
      scrollable
    >
      <SitePageCreateForm />
    </PageContainer>
  );
}
