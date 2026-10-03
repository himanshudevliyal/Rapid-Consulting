import PageContainer from "@/components/layout/page-container";
import BlogForm from "./blog-form";

export default function BlogEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit blog"} pageDescription={"Edit blog."}>
      <BlogForm type="edit" id={id} />
    </PageContainer>
  );
}