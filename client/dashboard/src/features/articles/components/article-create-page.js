import PageContainer from "@/components/layout/page-container";
import ArticleForm from "./article-form";

export default function ArticleCreatePage() {
  return (
    <PageContainer
      pageTitle={"Create Article"}
      pageDescription={"Write a new article. Only the title is required; the slug is made from it."}
      scrollable
    >
      <div className="max-w-5xl">
        <ArticleForm type="create" />
      </div>
    </PageContainer>
  );
}
