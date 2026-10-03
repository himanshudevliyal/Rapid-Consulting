import PageContainer from "@/components/layout/page-container";
import CaseStudyForm from "./case-study-form";

export default function CaseStudyCreatePage() {
  return (
    <PageContainer pageTitle={"Create Case Study"} pageDescription={"Create a new case study."}>
      <CaseStudyForm type="create" />
    </PageContainer>
  );
}
