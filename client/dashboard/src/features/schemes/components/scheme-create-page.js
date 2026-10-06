import PageContainer from "@/components/layout/page-container";
import SchemeForm from "./scheme-form";

export default function SchemeCreatePage() {
  return (
    <PageContainer
      pageTitle={"Create Scheme"}
      pageDescription={"Add a government scheme. Only the title is required; the slug is made from it."}
      scrollable
    >
      <div className="max-w-5xl">
        <SchemeForm type="create" />
      </div>
    </PageContainer>
  );
}
