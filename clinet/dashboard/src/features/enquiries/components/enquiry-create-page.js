import PageContainer from "@/components/layout/page-container";
import EnquiryForm from "./enquiry-form";

export default function EnquiryCreatePage() {
  return (
    <PageContainer pageTitle={"Create Enquiry"} pageDescription={"Create a new enquiry."}>
      <EnquiryForm type="create" />
    </PageContainer>
  );
}
