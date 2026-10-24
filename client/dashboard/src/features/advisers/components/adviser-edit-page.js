import PageContainer from "@/components/layout/page-container";
import AdviserForm from "./adviser-form";

export default function AdviserEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Adviser"} pageDescription={"Update the person's details."} scrollable>
      <div className="max-w-5xl">
        <AdviserForm type="edit" id={id} />
      </div>
    </PageContainer>
  );
}
