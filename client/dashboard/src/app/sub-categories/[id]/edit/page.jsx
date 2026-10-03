import SubCategoryEditPage from "@/features/sub-categories/components/sub-category-edit-page";

export default async function EditPage({ params }) {
  const { id } = await params;
  return <SubCategoryEditPage id={id} />;
}
