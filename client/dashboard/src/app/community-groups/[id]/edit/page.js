import CommunityGroupEditPage from "@/features/community-groups/components/community-group-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <CommunityGroupEditPage id={id} />;
}
