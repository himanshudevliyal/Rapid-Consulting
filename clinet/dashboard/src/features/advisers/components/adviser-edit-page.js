import PageContainer from "@/components/layout/page-container";
import AdviserForm from "./adviser-form";

export default function AdviserEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Adviser"} pageDescription={"Update adviser details."}>
      <AdviserForm type="edit" id={id} />
    </PageContainer>
  );
}
