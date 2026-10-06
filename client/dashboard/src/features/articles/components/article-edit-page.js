import PageContainer from "@/components/layout/page-container";
import ArticleForm from "./article-form";

export default function ArticleEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Article"} pageDescription={"Update the article and its content."} scrollable>
      <div className="max-w-5xl">
        <ArticleForm type="edit" id={id} />
      </div>
    </PageContainer>
  );
}
