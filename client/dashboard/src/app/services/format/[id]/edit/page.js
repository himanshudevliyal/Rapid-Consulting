import OptionEditPage from "@/features/service-options/components/option-edit-page";

export default async function EditFormatPage({ params }) {
  const { id } = await params;
  return <OptionEditPage kind="format" id={id} />;
}
