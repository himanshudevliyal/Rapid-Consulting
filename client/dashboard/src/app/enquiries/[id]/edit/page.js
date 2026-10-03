import EnquiriesEditPage from "@/features/enquiries/components/enquiry-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <EnquiriesEditPage id={id} />;
}
