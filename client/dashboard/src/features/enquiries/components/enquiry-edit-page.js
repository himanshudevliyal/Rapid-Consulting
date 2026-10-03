import PageContainer from "@/components/layout/page-container";
import EnquiryForm from "./enquiry-form";

export default function EnquiryEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Enquiry"} pageDescription={"Update enquiry details."}>
      <EnquiryForm type="edit" id={id} />
    </PageContainer>
  );
}
