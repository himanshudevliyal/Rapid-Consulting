import ArticlesEditPage from "@/features/articles/components/article-edit-page";
export default async function EditPage({ params }) {
  const { id } = await params;
  return <ArticlesEditPage id={id} />;
}
