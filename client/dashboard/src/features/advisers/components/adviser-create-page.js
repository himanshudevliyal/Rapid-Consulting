import PageContainer from "@/components/layout/page-container";
import AdviserForm from "./adviser-form";

export default function AdviserCreatePage() {
  return (
    <PageContainer pageTitle={"Create Adviser"} pageDescription={"Add a new adviser."}>
      <AdviserForm type="create" />
    </PageContainer>
  );
}
