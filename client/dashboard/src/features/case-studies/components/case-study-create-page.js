import PageContainer from "@/components/layout/page-container";
import CaseStudyForm from "./case-study-form";

export default function CaseStudyCreatePage() {
  return (
    <PageContainer
      pageTitle={"Create Case Study"}
      pageDescription={"Add a client story. Only the title is required; the slug is made from it."}
      scrollable
    >
      <div className="max-w-5xl">
        <CaseStudyForm type="create" />
      </div>
    </PageContainer>
  );
}
