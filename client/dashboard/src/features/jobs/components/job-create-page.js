import PageContainer from "@/components/layout/page-container";
import JobForm from "./job-form";

export default function JobCreatePage() {
  return (
    <PageContainer pageTitle={"Create Job"} pageDescription={"Post a new job listing."}>
      <JobForm type="create" />
    </PageContainer>
  );
}
