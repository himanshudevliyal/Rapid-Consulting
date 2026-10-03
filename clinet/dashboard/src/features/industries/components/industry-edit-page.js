import PageContainer from "@/components/layout/page-container";
import IndustryForm from "./industry-form";

export default function IndustryEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Industry"} pageDescription={"Update industry details."}>
      <IndustryForm type="edit" id={id} />
    </PageContainer>
  );
}
