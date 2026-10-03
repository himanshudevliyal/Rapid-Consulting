import PageContainer from "@/components/layout/page-container";
import SchemeForm from "./scheme-form";

export default function SchemeCreatePage() {
  return (
    <PageContainer pageTitle={"Create Scheme"} pageDescription={"Add a new government scheme."}>
      <SchemeForm type="create" />
    </PageContainer>
  );
}
