import AdvisersEditPage from "@/features/advisers/components/adviser-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <AdvisersEditPage id={id} />;
}
