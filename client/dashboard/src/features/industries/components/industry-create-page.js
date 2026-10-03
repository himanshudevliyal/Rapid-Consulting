import PageContainer from "@/components/layout/page-container";
import IndustryForm from "./industry-form";

export default function IndustryCreatePage() {
  return (
    <PageContainer pageTitle={"Create Industry"} pageDescription={"Add a new industry."}>
      <IndustryForm type="create" />
    </PageContainer>
  );
}
