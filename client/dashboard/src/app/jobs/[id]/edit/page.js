import JobsEditPage from "@/features/jobs/components/job-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <JobsEditPage id={id} />;
}
