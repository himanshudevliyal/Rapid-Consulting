import PageContainer from "@/components/layout/page-container";
import CommunityGroupForm from "./community-group-form";

export default function CommunityGroupEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Community Group"} pageDescription={"Update the group."} scrollable>
      <div className="max-w-5xl">
        <CommunityGroupForm type="edit" id={id} />
      </div>
    </PageContainer>
  );
}
