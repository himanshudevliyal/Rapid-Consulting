import CategoryEditPage from "@/features/categories/components/category-edit-page";

export default async function EditPage({ params }) {
  const { id } = await params;
  return <CategoryEditPage id={id} />;
}
