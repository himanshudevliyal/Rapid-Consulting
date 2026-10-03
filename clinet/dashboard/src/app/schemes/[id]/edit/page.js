import SchemesEditPage from "@/features/schemes/components/scheme-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <SchemesEditPage id={id} />;
}
