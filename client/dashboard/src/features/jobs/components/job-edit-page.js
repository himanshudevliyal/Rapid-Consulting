import PageContainer from "@/components/layout/page-container";
import JobForm from "./job-form";

export default function JobEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Job"} pageDescription={"Update the job listing."} scrollable>
      <div className="max-w-5xl">
        <JobForm type="edit" id={id} />
      </div>
    </PageContainer>
  );
}
