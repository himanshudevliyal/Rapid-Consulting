import PageContainer from "@/components/layout/page-container";
import CommunityGroupForm from "./community-group-form";

export default function CommunityGroupCreatePage() {
  return (
    <PageContainer
      pageTitle={"Create Community Group"}
      pageDescription={"Add a group visitors can join for updates. Only the name is required."}
      scrollable
    >
      <div className="max-w-5xl">
        <CommunityGroupForm type="create" />
      </div>
    </PageContainer>
  );
}
