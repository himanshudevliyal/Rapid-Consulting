import PageContainer from "@/components/layout/page-container";
import EnquiryForm from "./enquiry-form";
import { ENQUIRY_KINDS } from "./enquiry-kinds";

export default function EnquiryEditPage({ id, kind = "enquiry" }) {
  const config = ENQUIRY_KINDS[kind];
  return (
    <PageContainer
      pageTitle={config.singular}
      pageDescription={"See what was submitted and update its status or notes."}
      scrollable
    >
      <div className="max-w-5xl">
        <EnquiryForm id={id} kind={kind} />
      </div>
    </PageContainer>
  );
}
