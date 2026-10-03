import PageContainer from "@/components/layout/page-container";
import SchemeForm from "./scheme-form";

export default function SchemeEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Scheme"} pageDescription={"Update scheme details."}>
      <SchemeForm type="edit" id={id} />
    </PageContainer>
  );
}
