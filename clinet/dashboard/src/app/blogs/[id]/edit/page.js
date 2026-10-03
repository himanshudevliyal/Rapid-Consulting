import BlogEditPage from "@/features/blog/components/blog-edit-page";

export default async function EditPage({ params }) {
  const { id } = await params;
  return <BlogEditPage id={id} />;
}