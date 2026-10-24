import PageContainer from "@/components/layout/page-container";
import AdviserForm from "./adviser-form";

export default function AdviserCreatePage() {
  return (
    <PageContainer
      pageTitle={"Add Adviser"}
      pageDescription={"Add a person to the About page of the website. Only the name is required."}
      scrollable
    >
      <div className="max-w-5xl">
        <AdviserForm type="create" />
      </div>
    </PageContainer>
  );
}
