import ServiceEditPage from "@/features/services/components/service-edit-page";

export default async function EditPage({ params }) {
  const { id } = await params;
  return <ServiceEditPage id={id} />;
}
