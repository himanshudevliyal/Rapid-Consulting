import EnquiryEditPage from "@/features/enquiries/components/enquiry-edit-page";

export const metadata = { title: "Contact Enquiry" };

export default async function ContactEnquiryEditPage({ params }) {
  const { id } = await params;
  return <EnquiryEditPage id={id} kind="contact" />;
}
