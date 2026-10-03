import CaseStudyEditPage from "@/features/case-studies/components/case-study-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <CaseStudyEditPage id={id} />;
}
