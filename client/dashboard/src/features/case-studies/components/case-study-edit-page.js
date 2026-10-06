import PageContainer from "@/components/layout/page-container";
import CaseStudyForm from "./case-study-form";

export default function CaseStudyEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Case Study"} pageDescription={"Update the case study and its content."} scrollable>
      <div className="max-w-5xl">
        <CaseStudyForm type="edit" id={id} />
      </div>
    </PageContainer>
  );
}
