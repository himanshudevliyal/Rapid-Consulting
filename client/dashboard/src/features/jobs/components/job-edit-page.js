import PageContainer from "@/components/layout/page-container";
import JobForm from "./job-form";

export default function JobEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Job"} pageDescription={"Update job listing."}>
      <JobForm type="edit" id={id} />
    </PageContainer>
  );
}
