import PageContainer from "@/components/layout/page-container";
import SchemeForm from "./scheme-form";

export default function SchemeEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Scheme"} pageDescription={"Update the scheme and its content."} scrollable>
      <div className="max-w-5xl">
        <SchemeForm type="edit" id={id} />
      </div>
    </PageContainer>
  );
}
