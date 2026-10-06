import OptionEditPage from "@/features/service-options/components/option-edit-page";

export default async function EditFamilyTopicPage({ params }) {
  const { id } = await params;
  return <OptionEditPage kind="family-topic" id={id} />;
}
