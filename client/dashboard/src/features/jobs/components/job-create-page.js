import PageContainer from "@/components/layout/page-container";
import JobForm from "./job-form";

export default function JobCreatePage() {
  return (
    <PageContainer
      pageTitle={"Create Job"}
      pageDescription={"Post a new job. Only the title is required; the slug is made from it."}
      scrollable
    >
      <div className="max-w-5xl">
        <JobForm type="create" />
      </div>
    </PageContainer>
  );
}
