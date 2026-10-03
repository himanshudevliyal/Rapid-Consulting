import PageContainer from "@/components/layout/page-container";
import ArticleForm from "./article-form";

export default function ArticleCreatePage() {
  return (
    <PageContainer pageTitle={"Create Article"} pageDescription={"Create a new article."}>
      <ArticleForm type="create" />
    </PageContainer>
  );
}
