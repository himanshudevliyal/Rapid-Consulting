import PageContainer from "@/components/layout/page-container";
import BlogForm from "./blog-form";

export default function BlogCreatePage() {
  return (
    <PageContainer pageTitle={"Create blog"} pageDescription={"Create blog."}>
      <BlogForm type="create" />
    </PageContainer>
  );
} 

