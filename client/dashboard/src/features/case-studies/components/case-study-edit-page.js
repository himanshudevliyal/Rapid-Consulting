import PageContainer from "@/components/layout/page-container";
import CaseStudyForm from "./case-study-form";

export default function CaseStudyEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Case Study"} pageDescription={"Update case study."}>
      <CaseStudyForm type="edit" id={id} />
    </PageContainer>
  );
}
