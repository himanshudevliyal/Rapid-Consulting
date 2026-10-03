import IndustriesEditPage from "@/features/industries/components/industry-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <IndustriesEditPage id={id} />;
}
