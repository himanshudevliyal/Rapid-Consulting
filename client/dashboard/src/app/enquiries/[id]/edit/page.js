import EnquiryEditPage from "@/features/enquiries/components/enquiry-edit-page";

export const metadata = { title: "Service Enquiry" };

export default async function EditPage({ params }) {
  const { id } = await params;
  return <EnquiryEditPage id={id} kind="enquiry" />;
}
