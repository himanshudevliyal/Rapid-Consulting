import PageContainer from "@/components/layout/page-container";
import ArticleForm from "./article-form";

export default function ArticleEditPage({ id }) {
  return (
    <PageContainer pageTitle={"Edit Article"} pageDescription={"Update article."}>
      <ArticleForm type="edit" id={id} />
    </PageContainer>
  );
}
